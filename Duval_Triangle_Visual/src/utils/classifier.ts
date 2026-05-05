import { GasRecord, FaultType } from "../config";
import { IFaultSpecification } from "./faultSpecifications";

/**
 * Modern pure pipeline: Evaluates conditions using injected Specifications.
 */
export function classifyFaultWithSpecifications(data: GasRecord, specifications: IFaultSpecification[]): FaultType {
    // Guard clause: If all gas values sum to 0 (e.g., empty or invalid data), it cannot be classified.
    const totalGas = Object.values(data).reduce((sum, val) => sum + val, 0);
    if (totalGas === 0) {
        return "Unknown";
    }

    for (const spec of specifications) {
        if (spec.isSatisfiedBy(data)) {
            return spec.getFaultType();
        }
    }
    
    return "Unknown";
}