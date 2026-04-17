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

/**
 * Maps dynamic n-dimensional gas values into 2D cartesian space 
 * using the Center of Mass (Weighted Centroid) model.
 * Mathematically handles 3-simplex (Triangles) and 4-simplex (Pentagons).
 */
export function barycentricToCartesian(
    data: GasRecord,
    polygon: Point[],
    axes: AxisConfig[]
): Point {
    let x = 0;
    let y = 0;
    
    // Extract weights strictly in the order of configured axes
    const weights = axes.map(axis => data[axis.key] || 0);
    const total = weights.reduce((sum, w) => sum + w, 0);
    
    // Fallback: If all gas values are 0, return the centroid of the polygon
    if (total === 0) {
        return { 
            x: polygon.reduce((sum, p) => sum + p.x, 0) / polygon.length, 
            y: polygon.reduce((sum, p) => sum + p.y, 0) / polygon.length 
        };
    }

    // Linear combination of weights and vertex coordinates
    for (let i = 0; i < polygon.length; i++) {
        const point = polygon[i % polygon.length];
        const weight = weights[i] / total;
        x += weight * point.x;
        y += weight * point.y;
    }

    return { x, y };
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