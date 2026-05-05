import { normalizeData } from "./normalizer";
import { AxisConfig, GasRecord } from "../config";

export interface Point {
    x: number;
    y: number;
}

export interface PolarPoint {
    angle: number; // In radians
    radius: number;
}

export interface Edge {
    start: Point;
    end: Point;
    normal: Point;
    direction: Point;
    length: number;
}

/**
 * Creates a regular n-sided polygon. 
 * Starts at the top (-PI/2) and draws clockwise.
 */
export function createRegularPolygon(sides: number, radius: number): Point[] {
    const points: Point[] = [];
    for (let i = 0; i < sides; i++) {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / sides;
        points.push({
            x: radius * Math.cos(angle),
            y: radius * Math.sin(angle)
        });
    }
    return points;
}

/**
 * Creates an irregular polygon from explicitly defined polar coordinates.
 * Essential for custom 5-axis projections where angles/lengths are non-uniform.
 */
export function createIrregularPolygon(polarCoordinates: PolarPoint[]): Point[] {
    return polarCoordinates.map(p => ({
        x: p.radius * Math.cos(p.angle),
        y: p.radius * Math.sin(p.angle)
    }));
}

export function interpolate(p1: Point, p2: Point, t: number): Point {
    return {
        x: p1.x + (p2.x - p1.x) * t,
        y: p1.y + (p2.y - p1.y) * t
    };
}

/**
 * Calculates standardized geometric properties for polygon edges.
 * Works seamlessly for both regular and irregular convex polygons.
 */
export function getPolygonEdges(polygon: Point[]): Edge[] {
    const edges: Edge[] = [];

    for (let i = 0; i < polygon.length; i++) {
        const start = polygon[i];
        const end = polygon[(i + 1) % polygon.length];

        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const length = Math.sqrt(dx * dx + dy * dy);

        const direction = { x: dx / length, y: dy / length };

        // Outward normal assuming clockwise winding
        const normal = { x: -direction.y, y: direction.x };

        edges.push({ start, end, normal, direction, length });
    }

    return edges;
}

export function getDistance(p1: Point, p2: Point): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Checks if a calculated cartesian point falls strictly inside an irregular polygon.
 * Useful for validating if a mapped point has strayed out of bounds due to bad data.
 */
export function isPointInPolygon(point: Point, polygon: Point[]): boolean {
    let isInside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;

        const intersect = ((yi > point.y) !== (yj > point.y))
            && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);

        if (intersect) isInside = !isInside;
    }
    return isInside;
}

/**
 * Pure function: Projects normalized scalar weights onto 2D radial vectors.
 * Responsibility: Spatial mapping. Knows nothing about gases or Shoelace math.
 * * @param normalizedWeights Array of weights (must sum to 100) ordered to match the polygon vertices.
 * @param polygon The target polygon defining the directional axes.
 */
export function projectToRadialVectors(
    normalizedWeights: number[],
    polygon: Point[]
): Point[] {
    const n = polygon.length;
    const gasPoints: Point[] = [];

    for (let i = 0; i < n; i++) {
        const p = polygon[i];
        const r = Math.sqrt(p.x * p.x + p.y * p.y);
        
        // Prevent division by zero if a boundary vertex is at the origin
        const dirX = r === 0 ? 0 : p.x / r;
        const dirY = r === 0 ? 0 : p.y / r;
        
        gasPoints.push({
            x: normalizedWeights[i] * dirX,
            y: normalizedWeights[i] * dirY
        });
    }

    return gasPoints;
}

/**
 * Pure math function: Calculates the Geometric Area Centroid using the Shoelace formula.
 * Responsibility: Mathematical centroid calculation. Knows nothing about transformers or vectors.
 * * @param points An array of 2D points representing the boundary of the gas shape.
 */
export function calculateShoelaceCentroid(points: Point[]): Point {
    const n = points.length;
    if (n === 0) return { x: 0, y: 0 };

    let signedArea = 0;
    let cx = 0;
    let cy = 0;

    for (let i = 0; i < n; i++) {
        const curr = points[i];
        const next = points[(i + 1) % n];
        
        const cross = (curr.x * next.y) - (next.x * curr.y);
        signedArea += cross;
        cx += (curr.x + next.x) * cross;
        cy += (curr.y + next.y) * cross;
    }

    const area = signedArea / 2;

    // Fallback for collinear points / mathematically degenerate polygons
    if (area === 0) {
        return { 
            x: points.reduce((sum, pt) => sum + pt.x, 0) / n, 
            y: points.reduce((sum, pt) => sum + pt.y, 0) / n 
        };
    }

    return {
        x: cx / (6 * area),
        y: cy / (6 * area)
    };
}

export class MathFacade {
    /**
     * Orchestrates the transformation of raw gas data into a 2D Cartesian coordinate.
     * Strict Pipeline: Normalize -> Project to Vectors -> Calculate Centroid
     */
    static getCartesianCoordinate(
        data: GasRecord,
        polygon: Point[],
        axes: AxisConfig[]
    ): Point {
        // Step 1: Normalize (Pure)
        const normalizedData = normalizeData(data);
        
        // Map the normalized record to a strict array of weights matching the axis order
        const weights = axes.map(axis => normalizedData[axis.key] || 0);

        // Step 2: Project (Pure)
        const projectedPoints = projectToRadialVectors(weights, polygon);

        // Step 3: Centroid (Pure)
        return calculateShoelaceCentroid(projectedPoints);
    }
}