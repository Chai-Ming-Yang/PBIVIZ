import { GasRecord } from "../config";

/**
 * Generalizes normalization for n-dimensional data.
 */
export function normalizeData(input: GasRecord): GasRecord {
    const keys = Object.keys(input);
    const total = keys.reduce((sum, key) => sum + input[key], 0);

    const normalized: GasRecord = {};
    
    if (total === 0) {
        keys.forEach(key => normalized[key] = 0);
        return normalized;
    }

    keys.forEach(key => {
        normalized[key] = (input[key] / total) * 100;
    });

    return normalized;
}