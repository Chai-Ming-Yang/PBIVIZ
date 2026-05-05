export type FaultType = "PD" | "D1" | "D2" | "T1" | "T2" | "T3" | "T3-H" | "C" | "O" | "S" | "Unknown";

export const FAULT_COLORS: Record<FaultType, string> = {
    "PD": "#fff2de",
    "D1": "#ccc2dd",
    "D2": "#cfebf7",
    "T1": "#f2d0b8",
    "T2": "#d6f5e3",
    "T3": "#bcd9bc",
    "T3-H": "#a8d5a8",
    "C": "#b2dfdb",
    "O": "#c7d3ff",
    "S": "#ffcce6",
    "Unknown": "#ffffff"
};

export interface Point {
    x: number;
    y: number;
}

export interface IFaultSpecification {
    isSatisfiedBy(p: Point): boolean;
    getFaultType(): FaultType;
    getVertices(): Point[];
}

export abstract class BaseFaultSpecification implements IFaultSpecification {
    constructor(private readonly faultType: FaultType, private readonly vertices: Point[] = []) { }

    getFaultType(): FaultType {
        return this.faultType;
    }

    getVertices(): Point[] {
        return this.vertices;
    }

    isSatisfiedBy(p: Point): boolean {
        let isInside = false;
        const vs = this.vertices;
        for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            const xi = vs[i].x, yi = vs[i].y;
            const xj = vs[j].x, yj = vs[j].y;
            
            const intersect = ((yi > p.y) !== (yj > p.y))
                && (p.x < (xj - xi) * (p.y - yi) / (yj - yi) + xi);
            if (intersect) isInside = !isInside;
        }
        return isInside;
    }
}

export class Pentagon1Specifications {
    static getSpecifications(): IFaultSpecification[] {
        return [
            new class extends BaseFaultSpecification {
                constructor() { super("PD", [{x: 0, y: 33}, {x: -1, y: 33}, {x: -1, y: 24.5}, {x: 0, y: 24.5}]); }
            },
            new class extends BaseFaultSpecification {
                constructor() { super("D1", [{x: 0, y: 40}, {x: 38, y: 12}, {x: 32, y: -6.1}, {x: 4, y: 16}, {x: 0, y: 1.5}]); }
            },
            new class extends BaseFaultSpecification {
                constructor() { super("D2", [{x: 4, y: 16}, {x: 32, y: -6.1}, {x: 24.3, y: -30}, {x: 0, y: -3}, {x: 0, y: 1.5}]); }
            },
            new class extends BaseFaultSpecification {
                constructor() { super("T3", [{x: 0, y: -3}, {x: 24.3, y: -30}, {x: 23.5, y: -32.4}, {x: 1, y: -32.4}, {x: -6, y: -4}]); }
            },
            new class extends BaseFaultSpecification {
                constructor() { super("T2", [{x: -6, y: -4}, {x: 1, y: -32.4}, {x: -22.5, y: -32.4}]); }
            },
            new class extends BaseFaultSpecification {
                constructor() { super("T1", [{x: -6, y: -4}, {x: -22.5, y: -32.4}, {x: -23.5, y: -32.4}, {x: -35, y: 3}, {x: 0, y: 1.5}, {x: 0, y: -3}]); }
            },
            new class extends BaseFaultSpecification {
                constructor() { super("S", [{x: 0, y: 1.5}, {x: -35, y: 3}, {x: -38, y: 12.4}, {x: 0, y: 40}, {x: 0, y: 33}, {x: -1, y: 33}, {x: -1, y: 24.5}, {x: 0, y: 24.5}]); }
            }
        ];
    }
}

export class Pentagon2Specifications {
    static getSpecifications(): IFaultSpecification[] {
        return [
            new class extends BaseFaultSpecification {
                constructor() { super("PD", [{x: 0, y: 33}, {x: -1, y: 33}, {x: -1, y: 24.5}, {x: 0, y: 24.5}]); }
            },
            new class extends BaseFaultSpecification {
                constructor() { super("D1", [{x: 0, y: 40}, {x: 38, y: 12}, {x: 32, y: -6.1}, {x: 4, y: 16}, {x: 0, y: 1.5}]); }
            },
            new class extends BaseFaultSpecification {
                constructor() { super("D2", [{x: 4, y: 16}, {x: 32, y: -6.1}, {x: 24.3, y: -30}, {x: 0, y: -3}, {x: 0, y: 1.5}]); }
            },
            new class extends BaseFaultSpecification {
                constructor() { super("S", [{x: 0, y: 1.5}, {x: -35, y: 3.1}, {x: -38, y: 12.4}, {x: 0, y: 40}, {x: 0, y: 33}, {x: -1, y: 33}, {x: -1, y: 24.5}, {x: 0, y: 24.5}]); }
            },
            new class extends BaseFaultSpecification {
                constructor() { super("O", [{x: -3.5, y: -3}, {x: -11, y: -8}, {x: -21.5, y: -32.4}, {x: -23.5, y: -32.4}, {x: -35, y: 3.1}, {x: 0, y: 1.5}, {x: 0, y: -3}]); }
            },
            new class extends BaseFaultSpecification {
                constructor() { super("C", [{x: -3.5, y: -3}, {x: 2.5, y: -32.4}, {x: -21.5, y: -32.4}, {x: -11, y: -8}]); }
            },
            new class extends BaseFaultSpecification {
                constructor() { super("T3-H", [{x: 0, y: -3}, {x: 24.3, y: -30}, {x: 23.5, y: -32.4}, {x: 2.5, y: -32.4}, {x: -3.5, y: -3}]); }
            }
        ];
    }
}

export class FaultSpecificationFactory {
    static getSpecificationsForPentagon(pentagonId: string): IFaultSpecification[] {
        switch (pentagonId) {
            case "P1": return Pentagon1Specifications.getSpecifications();
            case "P2": return Pentagon2Specifications.getSpecifications();
            default: return [];
        }
    }
}