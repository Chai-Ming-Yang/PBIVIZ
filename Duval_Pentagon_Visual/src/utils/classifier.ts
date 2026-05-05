import { FaultType } from "./faultSpecifications";
import { Point } from "./geometry";
import { FaultSpecificationFactory } from "./faultSpecifications";

/**
 * Pure Domain Function: Diagnoses transformer faults based on mapped Cartesian coordinates.
 * Responsibility: Evaluates a mathematical point against predefined geometric boundaries.
 */
export function classifyFault(
    pentagonId: string,
    coord?: Point
): FaultType {
    
    // If no mathematical coordinate was provided, we cannot geometrically classify it.
    if (!coord) return "Unknown";

    const specifications = FaultSpecificationFactory.getSpecificationsForPentagon(pentagonId);

    for (const spec of specifications) {
        // Evaluate geometric intersection strictly using the specification pattern
        if (spec.isSatisfiedBy(coord)) {
            return spec.getFaultType();
        }
    }
    
    return "Unknown";
}