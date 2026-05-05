import { GasRecord } from "../../config";

export interface Shift {
    suffix: string;
    delta: GasRecord;
}

export interface TestPoint {
    id: string;
    gas: GasRecord;
    expected: string; // Explicitly define the ground truth
}

export class BoundaryShifter {
    static generateVariants(
        baseId: string, 
        baseGas: GasRecord, 
        anchorExpected: string, // Anchor's expected fault
        shifts: { suffix: string; delta: GasRecord; expected: string }[] // Variant's expected fault
    ): TestPoint[] {
        return [
            { id: baseId, gas: baseGas, expected: anchorExpected },
            ...shifts.map(s => {
                const shiftedGas: GasRecord = { ...baseGas };
                Object.keys(s.delta).forEach(key => {
                    shiftedGas[key] = Number((baseGas[key] + (s.delta[key] || 0)).toFixed(2));
                });
                return { id: `${baseId}-${s.suffix}`, gas: shiftedGas, expected: s.expected };
            })
        ];
    }
}

export class DateGenerator {
    private current: Date;
    constructor(startYear: number) {
        this.current = new Date(startYear, 0, 1);
    }
    next(): string {
        const d = new Date(this.current);
        this.current.setMonth(this.current.getMonth() + 1);
        return d.toISOString().split("T")[0];
    }
}