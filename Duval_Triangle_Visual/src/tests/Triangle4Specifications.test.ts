import { Triangle4Specifications } from "../utils/faultSpecifications";
import { classifyFaultWithSpecifications } from "../utils/classifier";
import { GasRecord } from "../config";
import { T4_BOUNDARY_SCENARIOS } from "./scenarios/Triangle4Scenarios";

describe("Duval Triangle 4 Specifications", () => {
    const specs = Triangle4Specifications.getSpecifications();

    const runTest = (data: GasRecord, expectedFault: string) => {
        const result = classifyFaultWithSpecifications(data, specs);
        expect(result).toBe(expectedFault);
    };

    // --- DYNAMIC DATA-DRIVEN TESTS ---
    T4_BOUNDARY_SCENARIOS.flat().forEach(({ id, gas, expected }) => {
        // Evaluate the actual result before defining the test to inject it into the title
        const actual = classifyFaultWithSpecifications(gas, specs);
        
        // Pad the ID to strictly 20 characters for aligned CLI output
        const paddedId = id.padEnd(20, ' ');
        
        it(`${paddedId} classified as ${actual} (expected ${expected})`, () => {
            expect(actual).toBe(expected); // Zero-magic comparison
        });
    });

    const edgeGas = { ch4: 0, c2h4: 0, c2h2: 0 };
    const edgeActual = classifyFaultWithSpecifications(edgeGas, specs);
    const edgeId = "All_Param_Zero".padEnd(20, ' ');

    it(`${edgeId} classified as ${edgeActual} (expected Unknown)`, () => {
        expect(edgeActual).toBe("Unknown");
    });
});