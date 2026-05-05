import { normalizeData } from "../utils/normalizer";
import { MathFacade, Point } from "../utils/geometry";
import { classifyFault } from "../utils/classifier";
import { PENTAGON_CONFIGS, GasRecord, AxisConfig } from "../config";
import { FaultType } from "../utils/faultSpecifications";

interface CaseStudy {
    source: string;
    description: string;
    rawGas: GasRecord;
    expectedPercentages: GasRecord;
    expectedCentroid: Point;
    expectedFault: FaultType;
}

// 100% Summit Coordinates matching the exact angular order defined in PENTAGON_CONFIGS["P1"].axes
// Order: H2 (Top), C2H2 (Right-Top), C2H4 (Right-Bottom), CH4 (Left-Bottom), C2H6 (Left-Top)
const DUVAL_AXIS_VERTICES: Point[] = [
    { x: 0, y: 100 },       // H2
    { x: 95.1, y: 30.9 },   // C2H2
    { x: 58.8, y: -80.9 },  // C2H4
    { x: -58.8, y: -80.9 }, // CH4
    { x: -95.1, y: 30.9 }   // C2H6
];

const LITERATURE_CASES: CaseStudy[] = [
    {
        source: "IEEE Electrical Insulation Magazine, Vol. 30, No. 6 (2014)",
        description: "Michel Duval's primary Pentagon worked example",
        rawGas: {
            h2: 31,
            c2h2: 0,
            c2h4: 31,
            ch4: 192,
            c2h6: 130
        },
        expectedPercentages: {
            h2: 8.07,    // 31 / 384
            c2h2: 0,     // 0 / 384
            c2h4: 8.07,  // 31 / 384
            ch4: 50.0,   // 192 / 384
            c2h6: 33.85  // 130 / 384
        },
        // Target derived from paper: (-17.3, -9.1)
        expectedCentroid: { x: -17.3, y: -9.1 },
        // Centroid falls clearly within the T1 zone boundaries defined in Pentagon1Specifications
        expectedFault: "T1" 
    }
];

describe("E2E Literature Validation: Pentagon 1", () => {
    
    LITERATURE_CASES.forEach((testCase) => {
        describe(`Source: ${testCase.source} - ${testCase.description}`, () => {
            
            // 1. Arrange & Act (Run the whole pipeline)
            const p1Axes: AxisConfig[] = PENTAGON_CONFIGS["P1"].axes;
            
            // Step 1: Normalization
            const calculatedPercentages = normalizeData(testCase.rawGas);
            
            // Step 2 & 3: Projection and Centroid Math
            const calculatedCentroid = MathFacade.getCartesianCoordinate(
                testCase.rawGas, 
                DUVAL_AXIS_VERTICES, 
                p1Axes
            );
            
            // Step 4: Spatial Classification
            const calculatedFault = classifyFault("P1", calculatedCentroid);

            // 2. Assertions
            it("calculates the correct relative gas percentages", () => {
                // Using toBeCloseTo to account for floating point fractions (e.g. 8.07%)
                expect(calculatedPercentages["h2"]).toBeCloseTo(testCase.expectedPercentages["h2"], 1);
                expect(calculatedPercentages["c2h2"]).toBeCloseTo(testCase.expectedPercentages["c2h2"], 1);
                expect(calculatedPercentages["c2h4"]).toBeCloseTo(testCase.expectedPercentages["c2h4"], 1);
                expect(calculatedPercentages["ch4"]).toBeCloseTo(testCase.expectedPercentages["ch4"], 1);
                expect(calculatedPercentages["c2h6"]).toBeCloseTo(testCase.expectedPercentages["c2h6"], 1);
            });

            it("plots the centroid strictly matching the published coordinates", () => {
                // The paper rounds the final centroid to one decimal place, so we test with precision: 1
                expect(calculatedCentroid.x).toBeCloseTo(testCase.expectedCentroid.x, 1);
                expect(calculatedCentroid.y).toBeCloseTo(testCase.expectedCentroid.y, 1);
            });

            it(`classifies the coordinate into the correct fault zone (${testCase.expectedFault})`, () => {
                expect(calculatedFault).toBe(testCase.expectedFault);
            });
        });
    });
});