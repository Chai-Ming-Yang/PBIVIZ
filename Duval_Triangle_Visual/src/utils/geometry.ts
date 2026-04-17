import { AxisConfig, GasRecord } from "../config";

export interface Point {
    x: number;
    y: number;
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
        // Start at 12 o'clock (-90 degrees) and rotate clockwise
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / sides;
        points.push({
            x: radius * Math.cos(angle),
            y: radius * Math.sin(angle)
        });
    }
    return points;
}

/**
 * Maps dynamic n-dimensional gas values into 2D cartesian space 
 * using generalized barycentric coordinates.
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
    
    if (total === 0) return { x: 0, y: 0 };

    for (let i = 0; i < polygon.length; i++) {
        // Loop around polygon if there are more weights than vertices (fallback protection)
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
 * Calculates standardized geometric properties for polygon edges, 
 * automatically deriving normals for tick marks and offsets.
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