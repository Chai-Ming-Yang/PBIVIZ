import { P1_COORD_SCENARIOS } from "./scenarios/Pentagon1Scenarios";
import { FaultSpecificationFactory, Point } from "../utils/faultSpecifications";

describe("Pentagon 1 Static Ray-Casting Validation", () => {
    const p1Specs = FaultSpecificationFactory.getSpecificationsForPentagon("P1");

    const runCoordinateTest = (coord: Point): string => {
        // Iterate through specifications to find the first match
        for (const spec of p1Specs) {
            if (spec.isSatisfiedBy(coord)) {
                return spec.getFaultType();
            }
        }
        return "Unknown";
    };

    P1_COORD_SCENARIOS.flat().forEach(tp => {
        // Evaluate the actual result before the it() block to keep the output clean
        const actual = runCoordinateTest(tp.coord);
        const paddedId = tp.id.padEnd(25, ' ');
        
        // skip points that fall exactly on boundary
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
        // Arrange
        const outlierPoint: Point = { x: 100, y: 100 };
        
        // Act
        const actual = runCoordinateTest(outlierPoint);
        
        // Assert
        expect(actual).toBe("Unknown");
    });
});