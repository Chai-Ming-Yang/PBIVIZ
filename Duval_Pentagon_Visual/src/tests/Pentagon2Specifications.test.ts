import { P2_COORD_SCENARIOS } from "./scenarios/Pentagon2Scenarios";
import { FaultSpecificationFactory, Point } from "../utils/faultSpecifications";

describe("Pentagon 2 Static Ray-Casting Validation", () => {
    // Fetch the specifications mapped specifically for Duval Pentagon 2
    const p2Specs = FaultSpecificationFactory.getSpecificationsForPentagon("P2");

    const runCoordinateTest = (coord: Point): string => {
        // Iterate through specifications to find the first match using the ray-casting algorithm
        for (const spec of p2Specs) {
            if (spec.isSatisfiedBy(coord)) {
                return spec.getFaultType();
            }
        }
        return "Unknown";
    };

    P2_COORD_SCENARIOS.flat().forEach(tp => {
        // Evaluate the actual result before the it() block to keep the output clean
        const actual = runCoordinateTest(tp.coord);
        const paddedId = tp.id.padEnd(25, ' ');
        
        // Critical Architectural Rule #1: Skip points that fall exactly on a boundary
        const boundaryTypes = ["Edge", "Corner", "Junction"];
        if (boundaryTypes.includes(tp.expected)) {
            it.skip(`${paddedId} evaluated as ${actual} (Anchor point on exact boundary)`, () => {});
            return;
        }

        it(`${paddedId} classified as ${actual.padEnd(7, ' ')} | expected: ${tp.expected}`, () => {
            // Assert
            expect(actual).toBe(tp.expected);
        });
    });

    it("strictly returns 'Unknown' for coordinates way outside the pentagon", () => {
        // Arrange: Use an extreme outlier point well beyond any defined P2 boundary
        const outlierPoint: Point = { x: 100, y: 100 };
        
        // Act
        const actual = runCoordinateTest(outlierPoint);
        
        // Assert
        expect(actual).toBe("Unknown");
    });
});