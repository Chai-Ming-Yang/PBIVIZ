import * as fs from "fs";
import { TRIANGLE_CONFIGS, GasRecord } from "../../config";
import { classifyFaultWithSpecifications } from "../../utils/classifier";
import { FaultSpecificationFactory } from "../../utils/faultSpecifications";
import { BoundaryShifter, DateGenerator, TestPoint } from "./TestUtils";

export function generateTriangleCSV(triangleId: string, scenarios: TestPoint[][]) {
    const config = TRIANGLE_CONFIGS[triangleId];
    const specs = FaultSpecificationFactory.getSpecificationsForTriangle(triangleId);
    const dateGen = new DateGenerator(2020);
    
    // Dynamically label the headers based on the config axes
    const headers = [
        "Date",
        "Test_Case_ID",
        ...config.axes.map(a => a.label.replace(/[^A-Za-z0-9₂₄₆]/g, '').trim()),
        "Expected_Fault"
    ];

    const rows: string[] = [headers.join(",")];

    scenarios.flat().forEach(tp => {
        const fault = classifyFaultWithSpecifications(tp.gas, specs);
        const row = [
            dateGen.next(),
            tp.id,
            ...config.axes.map(axis => tp.gas[axis.key] || 0),
            fault
        ];
        rows.push(row.join(","));
    });

    const fileName = `src/tests/output/Triangle${triangleId}_Validation.csv`;
    if (!fs.existsSync("src/tests/output")) fs.mkdirSync("src/tests/output", { recursive: true });
    
    fs.writeFileSync(fileName, rows.join("\n"));
    console.log(`✅ Exported: ${fileName}`);
}