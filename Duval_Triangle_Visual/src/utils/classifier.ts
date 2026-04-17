import { GasRecord, FaultType, RegionConfig } from "../config";

/**
 * Evaluates conditions against n-dimensional records dynamically 
 * based on the active triangle configuration.
 */
export function classifyFault(data: GasRecord, regions: RegionConfig[]): FaultType {
    for (const region of regions) {
        if (region.condition(data)) {
            return region.key;
        }
    }

    return "Unknown";
}