import { 
    calculateShoelaceCentroid, 
    projectToRadialVectors, 
    Point 
} from "../../src/utils/geometry";

describe("Pure Math Verification: geometry.ts", () => {

    describe("calculateShoelaceCentroid()", () => {
        it("accurately calculates the centroid of a standard square", () => {
            // Arrange: A 10x10 square starting at origin
            const square: Point[] = [
                { x: 0, y: 0 },
                { x: 10, y: 0 },
                { x: 10, y: 10 },
                { x: 0, y: 10 }
            ];

            // Act
            const centroid = calculateShoelaceCentroid(square);

            // Assert: The mathematical center must be exactly (5, 5)
            expect(centroid.x).toBeCloseTo(5, 5);
            expect(centroid.y).toBeCloseTo(5, 5);
        });

        it("accurately calculates the centroid of an asymmetrical right triangle", () => {
            // Arrange: A triangle with base 6, height 9
            const triangle: Point[] = [
                { x: 0, y: 0 },
                { x: 6, y: 0 },
                { x: 0, y: 9 }
            ];

            // Act
            const centroid = calculateShoelaceCentroid(triangle);

            // Assert: Centroid of right triangle is (base/3, height/3) -> (2, 3)
            expect(centroid.x).toBeCloseTo(2, 5);
            expect(centroid.y).toBeCloseTo(3, 5);
        });

        it("safely falls back to an average coordinate for a degenerate polygon (zero area)", () => {
            // Arrange: A flat line where area calculation would result in division by zero
            const flatLine: Point[] = [
                { x: 0, y: 0 },
                { x: 10, y: 0 },
                { x: 20, y: 0 }
            ];

            // Act
            const centroid = calculateShoelaceCentroid(flatLine);

            // Assert: Should fallback to averaging the points -> (10, 0)
            expect(centroid.x).toBeCloseTo(10, 5);
            expect(centroid.y).toBeCloseTo(0, 5);
        });
    });

    describe("projectToRadialVectors()", () => {
        it("maps identical weights symmetrically, canceling out to a zero-sum projection", () => {
            // Arrange: A 4-axis "cross" polygon for simple math verification
            const crossPolygon: Point[] = [
                { x: 0, y: 10 },  // North
                { x: 10, y: 0 },  // East
                { x: 0, y: -10 }, // South
                { x: -10, y: 0 }  // West
            ];
            
            // 25% weight evenly distributed to all 4 axes
            const weights = [25, 25, 25, 25];

            // Act
            const projectedPoints = projectToRadialVectors(weights, crossPolygon);
            const centroid = calculateShoelaceCentroid(projectedPoints);

            // Assert: Symmetrical pull from all directions must result in the exact center (0,0)
            expect(centroid.x).toBeCloseTo(0, 5);
            expect(centroid.y).toBeCloseTo(0, 5);
        });
    });
});