import { GasRecord, RegionConfig, FaultType } from "../config";
import { Point } from "./geometry";

export function classifyFault(
    data: GasRecord,
    regions: RegionConfig[],
    coord?: Point
): FaultType {
    for (const region of regions) {
        // Using .call() to explicitly bind `this` to the RegionConfig object
        if (region.condition.call(region, data, coord)) {
            return region.key;
        }
    }
    return "Unknown";
}