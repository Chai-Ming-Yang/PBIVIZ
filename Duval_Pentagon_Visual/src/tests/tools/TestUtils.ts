import { GasRecord } from "../../config";
import { Point } from "../../utils/faultSpecifications";

// --- Gas Record Shifting (Retained for Step 3 E2E / CSV integration) ---
export interface Shift {
    suffix: string;
    delta: GasRecord;
}

export interface TestPoint {
    id: string;
    gas: GasRecord;
    expected: string;
}

export class BoundaryShifter {
    static generateVariants(
        baseId: string, 
        baseGas: GasRecord, 
        anchorExpected: string, 
        shifts: { suffix: string; delta: GasRecord; expected: string }[] 
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

// --- Coordinate Shifting (Added for Step 2 Ray-Casting Verification) ---
export interface CoordinateShift {
    suffix: string;
    delta: Partial<Point>;
    expected: string;
}

export interface CoordinateTestPoint {
    id: string;
    coord: Point;
    expected: string;
}

export class CoordinateBoundaryShifter {
    static generateVariants(
        baseId: string,
        baseCoord: Point,
        anchorExpected: string,
        shifts: CoordinateShift[]
    ): CoordinateTestPoint[] {
        return [
            { id: baseId, coord: baseCoord, expected: anchorExpected },
            ...shifts.map(s => {
                const shiftedCoord: Point = {
                    x: Number((baseCoord.x + (s.delta.x || 0)).toFixed(4)),
                    y: Number((baseCoord.y + (s.delta.y || 0)).toFixed(4))
                };
                return { id: `${baseId}-${s.suffix}`, coord: shiftedCoord, expected: s.expected };
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