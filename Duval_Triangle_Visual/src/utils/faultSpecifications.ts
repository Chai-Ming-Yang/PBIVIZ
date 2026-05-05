import { GasRecord, FaultType } from "../config";

export interface IFaultSpecification {
    isSatisfiedBy(g: GasRecord): boolean;
    getFaultType(): FaultType;
    getVertices(): GasRecord[];
}

export abstract class BaseFaultSpecification implements IFaultSpecification {
    constructor(private readonly faultType: FaultType, private readonly vertices: GasRecord[] = []) { }

    abstract isSatisfiedBy(g: GasRecord): boolean;

    getFaultType(): FaultType {
        return this.faultType;
    }

    getVertices(): GasRecord[] {
        return this.vertices;
    }
}

export class Triangle1Specifications {
    static getSpecifications(): IFaultSpecification[] {
        return [
            new class extends BaseFaultSpecification {
                constructor() { super("PD", [{ ch4: 100, c2h4: 0, c2h2: 0 }, { ch4: 98, c2h4: 2, c2h2: 0 }, { ch4: 98, c2h4: 0, c2h2: 2 }]); }
                isSatisfiedBy(g: GasRecord): boolean { return g.ch4 >= 98; }
            },
            new class extends BaseFaultSpecification {
                constructor() { super("T1", [{ ch4: 98, c2h4: 2, c2h2: 0 }, { ch4: 80, c2h4: 20, c2h2: 0 }, { ch4: 76, c2h4: 20, c2h2: 4 }, { ch4: 96, c2h4: 0, c2h2: 4 }, { ch4: 98, c2h4: 0, c2h2: 2 }]); }
                isSatisfiedBy(g: GasRecord): boolean { return g.ch4 < 98 && g.c2h4 < 20 && g.c2h2 < 4; }
            },
            new class extends BaseFaultSpecification {
                constructor() { super("T2", [{ ch4: 80, c2h4: 20, c2h2: 0 }, { ch4: 50, c2h4: 50, c2h2: 0 }, { ch4: 46, c2h4: 50, c2h2: 4 }, { ch4: 76, c2h4: 20, c2h2: 4 }]); }
                isSatisfiedBy(g: GasRecord): boolean { return g.c2h4 >= 20 && g.c2h4 < 50 && g.c2h2 < 4; }
            },
            new class extends BaseFaultSpecification {
                constructor() { super("T3", [{ ch4: 50, c2h4: 50, c2h2: 0 }, { ch4: 0, c2h4: 100, c2h2: 0 }, { ch4: 0, c2h4: 85, c2h2: 15 }, { ch4: 35, c2h4: 50, c2h2: 15 }]); }
                isSatisfiedBy(g: GasRecord): boolean { return g.c2h4 >= 50 && g.c2h2 < 15; }
            },
            new class extends BaseFaultSpecification {
                constructor() { super("DT", [{ ch4: 96, c2h4: 0, c2h2: 4 }, { ch4: 46, c2h4: 50, c2h2: 4 }, { ch4: 35, c2h4: 50, c2h2: 15 }, { ch4: 0, c2h4: 85, c2h2: 15 }, { ch4: 0, c2h4: 71, c2h2: 29 }, { ch4: 21, c2h4: 50, c2h2: 29 }, { ch4: 31, c2h4: 40, c2h2: 29 }, { ch4: 47, c2h4: 40, c2h2: 13 }, { ch4: 87, c2h4: 0, c2h2: 13 }]); }
                isSatisfiedBy(g: GasRecord): boolean { return (g.c2h4 < 50 && g.c2h2 >= 4 && g.c2h2 < 13) || (g.c2h4 >= 40 && g.c2h4 < 50 && g.c2h2 >= 13 && g.c2h2 < 29) || (g.c2h4 >= 50 && g.c2h2 >= 15 && g.c2h2 < 29); }
            },
            new class extends BaseFaultSpecification {
                constructor() { super("D1", [{ ch4: 87, c2h4: 0, c2h2: 13 }, { ch4: 64, c2h4: 23, c2h2: 13 }, { ch4: 0, c2h4: 23, c2h2: 77 }, { ch4: 0, c2h4: 0, c2h2: 100 }]); }
                isSatisfiedBy(g: GasRecord): boolean { return g.c2h4 < 23 && g.c2h2 >= 13; }
            },
            new class extends BaseFaultSpecification {
                constructor() { super("D2", [{ ch4: 64, c2h4: 23, c2h2: 13 }, { ch4: 47, c2h4: 40, c2h2: 13 }, { ch4: 31, c2h4: 40, c2h2: 29 }, { ch4: 0, c2h4: 71, c2h2: 29 }, { ch4: 0, c2h4: 23, c2h2: 77 }]); }
                isSatisfiedBy(g: GasRecord): boolean { return (g.c2h4 >= 23 && g.c2h2 >= 29) || (g.c2h4 >= 23 && g.c2h4 < 40 && g.c2h2 >= 13 && g.c2h2 < 29); }
            }
        ];
    }
}

export class Triangle4Specifications {
    static getSpecifications(): IFaultSpecification[] {

        const isPD = (g: GasRecord) =>
            g.ch4 >= 2 && g.ch4 < 15 && g.c2h6 < 1;

        const isND = (g: GasRecord) =>
            g.h2 >= 9 && g.c2h6 >= 46;

        const isO = (g: GasRecord) =>
            g.h2 < 9 && g.c2h6 >= 30;

        const isC = (g: GasRecord) =>
            (g.ch4 >= 36 && g.c2h6 < 24) ||
            (g.h2 < 15 && g.c2h6 >= 24 && g.c2h6 < 30);

        const isS = (g: GasRecord) =>
            !isPD(g) && !isND(g) && !isO(g) && !isC(g);

        // EVALUATION ORDER
        return [
            new class extends BaseFaultSpecification {
                constructor() { 
                    super("PD", [
                        { h2: 98, c2h6: 0, ch4: 2 }, { h2: 85, c2h6: 0, ch4: 15 }, { h2: 84, c2h6: 1, ch4: 15 }, { h2: 97, c2h6: 1, ch4: 2 }
                    ]); 
                }
                isSatisfiedBy(g: GasRecord): boolean { return isPD(g); }
            },
            new class extends BaseFaultSpecification {
                constructor() { 
                    super("ND", [
                        { h2: 9, c2h6: 46, ch4: 45 }, { h2: 9, c2h6: 91, ch4: 0 }, { h2: 54, c2h6: 46, ch4: 0 }
                    ]); 
                }
                isSatisfiedBy(g: GasRecord): boolean { return isND(g); }
            },
            new class extends BaseFaultSpecification {
                constructor() { 
                    super("O", [
                        { h2: 9, c2h6: 30, ch4: 61 }, { h2: 9, c2h6: 91, ch4: 0 }, { h2: 0, c2h6: 100, ch4: 0 }, { h2: 0, c2h6: 30, ch4: 70 }
                    ]); 
                }
                isSatisfiedBy(g: GasRecord): boolean { return isO(g); }
            },
            new class extends BaseFaultSpecification {
                constructor() { 
                    super("C", [
                        { h2: 64, c2h6: 0, ch4: 36 }, { h2: 0, c2h6: 0, ch4: 100 }, { h2: 0, c2h6: 30, ch4: 70 }, { h2: 15, c2h6: 30, ch4: 55 }, { h2: 15, c2h6: 24, ch4: 61 }, { h2: 40, c2h6: 24, ch4: 36 }
                    ]); 
                }
                isSatisfiedBy(g: GasRecord): boolean { return isC(g); }
            },
            new class extends BaseFaultSpecification {
                constructor() { 
                    super("S", [
                        { h2: 100, c2h6: 0, ch4: 0 }, { h2: 98, c2h6: 0, ch4: 2 }, { h2: 97, c2h6: 1, ch4: 2 }, { h2: 84, c2h6: 1, ch4: 15 }, { h2: 85, c2h6: 0, ch4: 15 }, { h2: 64, c2h6: 0, ch4: 36 }, { h2: 40, c2h6: 24, ch4: 36 }, { h2: 15, c2h6: 24, ch4: 61 }, { h2: 15, c2h6: 30, ch4: 55 }, { h2: 9, c2h6: 30, ch4: 61 }, { h2: 9, c2h6: 46, ch4: 45 }, { h2: 54, c2h6: 46, ch4: 0 }
                    ]); 
                }
                isSatisfiedBy(g: GasRecord): boolean { return isS(g); }
            }
        ];
    }
}

export class Triangle5Specifications {
    static getSpecifications(): IFaultSpecification[] {
        return [
            new class extends BaseFaultSpecification {
                constructor() { super("PD", [{ ch4: 98, c2h6: 2, c2h4: 0 }, { ch4: 86, c2h6: 14, c2h4: 0 }, { ch4: 85, c2h6: 14, c2h4: 1 }, { ch4: 97, c2h6: 2, c2h4: 1 }]); }
                isSatisfiedBy(g: GasRecord): boolean { return g.c2h4 < 1 && g.c2h6 >= 2 && g.c2h6 < 14; }
            },
            new class extends BaseFaultSpecification {
                constructor() { super("O", [{ ch4: 100, c2h6: 0, c2h4: 0 }, { ch4: 98, c2h6: 2, c2h4: 0 }, { ch4: 97, c2h6: 2, c2h4: 1 }, { ch4: 85, c2h6: 14, c2h4: 1 }, { ch4: 76, c2h6: 14, c2h4: 10 }, { ch4: 90, c2h6: 0, c2h4: 10 }]); }
                isSatisfiedBy(g: GasRecord): boolean { return (g.c2h4 >= 1 && g.c2h4 < 10 && g.c2h6 >= 2 && g.c2h6 < 14) || (g.c2h4 < 10 && g.c2h6 < 2); }
            },
            new class extends BaseFaultSpecification {
                constructor() { super("O", [{ ch4: 46, c2h6: 54, c2h4: 0 }, { ch4: 0, c2h6: 100, c2h4: 0 }, { ch4: 0, c2h6: 90, c2h4: 10 }, { ch4: 36, c2h6: 54, c2h4: 10 }]); }
                isSatisfiedBy(g: GasRecord): boolean { return (g.c2h4 < 10 && g.c2h6 >= 54); }
            },
            new class extends BaseFaultSpecification {
                constructor() { super("S", [{ ch4: 86, c2h6: 14, c2h4: 0 }, { ch4: 46, c2h6: 54, c2h4: 0 }, { ch4: 36, c2h6: 54, c2h4: 10 }, { ch4: 76, c2h6: 14, c2h4: 10 }]); }
                isSatisfiedBy(g: GasRecord): boolean { return g.c2h4 < 10 && g.c2h6 >= 14 && g.c2h6 < 54; }
            },
            new class extends BaseFaultSpecification {
                constructor() { super("T2", [{ ch4: 90, c2h6: 0, c2h4: 10 }, { ch4: 78, c2h6: 12, c2h4: 10 }, { ch4: 53, c2h6: 12, c2h4: 35 }, { ch4: 65, c2h6: 0, c2h4: 35 }]); }
                isSatisfiedBy(g: GasRecord): boolean { return g.c2h4 >= 10 && g.c2h4 < 35 && g.c2h6 < 12; }
            },
            new class extends BaseFaultSpecification {
                constructor() { super("T3", [{ ch4: 65, c2h6: 0, c2h4: 35 }, { ch4: 53, c2h6: 12, c2h4: 35 }, { ch4: 38, c2h6: 12, c2h4: 50 }, { ch4: 36, c2h6: 14, c2h4: 50 }, { ch4: 16, c2h6: 14, c2h4: 70 }, { ch4: 0, c2h6: 30, c2h4: 70 }, { ch4: 35, c2h6: 30, c2h4: 35 }, { ch4: 0, c2h6: 65, c2h4: 35 }, { ch4: 0, c2h6: 0, c2h4: 100 }]); }
                isSatisfiedBy(g: GasRecord): boolean { return (g.c2h4 >= 35 && g.c2h6 < 12) || (g.c2h4 >= 50 && g.c2h6 >= 12 && g.c2h6 < 14) || (g.c2h4 >= 70 && g.c2h6 >= 14) || (g.c2h4 >= 35 && g.c2h6 >= 30); }
            },
            new class extends BaseFaultSpecification {
                constructor() { super("C", [{ ch4: 78, c2h6: 12, c2h4: 10 }, { ch4: 76, c2h6: 14, c2h4: 10 }, { ch4: 60, c2h6: 30, c2h4: 10 }, { ch4: 0, c2h6: 30, c2h4: 70 }, { ch4: 16, c2h6: 14, c2h4: 70 }, { ch4: 36, c2h6: 14, c2h4: 50 }, { ch4: 38, c2h6: 12, c2h4: 50 }]); }
                isSatisfiedBy(g: GasRecord): boolean { return (g.c2h4 >= 10 && g.c2h4 < 50 && g.c2h6 >= 12 && g.c2h6 < 14) || (g.c2h4 >= 10 && g.c2h4 < 70 && g.c2h6 >= 14 && g.c2h6 < 30); }
            },
            new class extends BaseFaultSpecification {
                constructor() { super("ND", [{ ch4: 60, c2h6: 30, c2h4: 10 }, { ch4: 0, c2h6: 90, c2h4: 10 }, { ch4: 0, c2h6: 65, c2h4: 35 }, { ch4: 35, c2h6: 30, c2h4: 35 }]); }
                isSatisfiedBy(g: GasRecord): boolean { return g.c2h4 >= 10 && g.c2h4 < 35 && g.c2h6 >= 30; }
            }
        ];
    }
}

export class FaultSpecificationFactory {
    static getSpecificationsForTriangle(triangleId: string): IFaultSpecification[] {
        switch (triangleId) {
            case "1": return Triangle1Specifications.getSpecifications();
            case "4": return Triangle4Specifications.getSpecifications();
            case "5": return Triangle5Specifications.getSpecifications();
            default: return [];
        }
    }
}