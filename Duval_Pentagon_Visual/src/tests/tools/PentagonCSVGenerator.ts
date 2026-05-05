import * as fs from "fs";
import { classifyFault } from "../../utils/classifier";
import { DateGenerator } from "./TestUtils";
import { MathFacade, Point } from "../../utils/geometry";
import { GasRecord, AxisConfig } from "../../config";

export interface GasTestRecord {
    id: string;
    gas: GasRecord;
    expectedDP1: string;
    expectedDP2: string;
}

export class SyntheticDataGenerator {
    /**
     * Generates a unified 5-gas dataset satisfying quotas for both DP1 and DP2.
     */
    static generateUnifiedMonteCarloDataset(
        targetRegionsDP1: string[], 
        targetRegionsDP2: string[], 
        pointsPerRegion: number,
        axisVertices: Point[],
        axesConfigP1: AxisConfig[], // DP1 and DP2 share identical axis geometry
    ): GasTestRecord[] {
        const results: GasTestRecord[] = [];
        
        // Track quotas independently for both pentagons
        const quotasDP1 = new Map<string, number>();
        const quotasDP2 = new Map<string, number>();
        targetRegionsDP1.forEach(r => quotasDP1.set(r, 0));
        targetRegionsDP2.forEach(r => quotasDP2.set(r, 0));

        let iterations = 0;
        const maxIterations = 5000000;

        while (iterations < maxIterations) {
            iterations++;
            
            // 1. Generate random valid gas percentages (Sum = 100%)
            const r1 = Math.random();
            const r2 = Math.random();
            const r3 = Math.random();
            const r4 = Math.random();
            const r5 = Math.random();
            const sum = r1 + r2 + r3 + r4 + r5;
            
            const randomGas: GasRecord = {
                h2: Number(((r1 / sum) * 100).toFixed(2)),
                c2h2: Number(((r2 / sum) * 100).toFixed(2)),
                c2h4: Number(((r3 / sum) * 100).toFixed(2)),
                ch4: Number(((r4 / sum) * 100).toFixed(2)),
                c2h6: Number(((r5 / sum) * 100).toFixed(2))
            };

            // 2. Project forward to Cartesian Coordinate
            // Note: DP1 and DP2 use the exact same axis projection, so we only need to calculate this once
            const centroid = MathFacade.getCartesianCoordinate(randomGas, axisVertices, axesConfigP1);

            // 3. Classify the resulting point against BOTH pentagons
            const faultDP1 = classifyFault("P1", centroid);
            const faultDP2 = classifyFault("P2", centroid);

            // 4. Evaluate against quotas
            const currentCountDP1 = quotasDP1.get(faultDP1) || 0;
            const currentCountDP2 = quotasDP2.get(faultDP2) || 0;
            
            let pointKept = false;

            if (targetRegionsDP1.includes(faultDP1) && currentCountDP1 < pointsPerRegion) {
                quotasDP1.set(faultDP1, currentCountDP1 + 1);
                pointKept = true;
            }

            if (targetRegionsDP2.includes(faultDP2) && currentCountDP2 < pointsPerRegion) {
                quotasDP2.set(faultDP2, currentCountDP2 + 1);
                pointKept = true;
            }

            // If the point helped satisfy EITHER quota, save it to the master list
            if (pointKept) {
                results.push({
                    id: `Unified_Syn_${results.length + 1}`,
                    gas: randomGas,
                    expectedDP1: faultDP1,
                    expectedDP2: faultDP2
                });
            }

            // 5. Exit condition: Ensure ALL regions across BOTH pentagons have 10 points
            let allDP1Met = targetRegionsDP1.every(r => (quotasDP1.get(r) || 0) >= pointsPerRegion);
            let allDP2Met = targetRegionsDP2.every(r => (quotasDP2.get(r) || 0) >= pointsPerRegion);
            
            if (allDP1Met && allDP2Met) break;
        }

        if (iterations >= maxIterations) {
            console.warn(`[Warning] Generator hit iteration limit (${maxIterations}). Some quotas may be incomplete.`);
        }

        return results;
    }
}

export class PentagonCSVGenerator {
    static exportGasRecords(data: GasTestRecord[]) {
        const dateGen = new DateGenerator(2020);
        
        // Added the dual expectation columns
        const headers = [
            "Date",
            "Test_Case_ID",
            "H2",
            "C2H2",
            "C2H4",
            "CH4",
            "C2H6",
            "Expected_DP1",
            "Expected_DP2"
        ];

        const rows: string[] = [headers.join(",")];

        data.forEach(tp => {
            const row = [
                dateGen.next(),
                tp.id,
                tp.gas.h2.toString(),
                tp.gas.c2h2.toString(),
                tp.gas.c2h4.toString(),
                tp.gas.ch4.toString(),
                tp.gas.c2h6.toString(),
                tp.expectedDP1,
                tp.expectedDP2
            ];
            rows.push(row.join(","));
        });

        const fileName = `src/tests/output/Pentagon_PBIVIZ_Data.csv`;
        if (!fs.existsSync("src/tests/output")) fs.mkdirSync("src/tests/output", { recursive: true });
        
        fs.writeFileSync(fileName, rows.join("\n"));
        
        console.log(`\x1b[32m√\x1b[0m Exported Synthetic Gas PBIVIZ Dataset: ${fileName}`);
    }
}