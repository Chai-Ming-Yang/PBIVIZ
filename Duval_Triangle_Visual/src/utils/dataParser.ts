import powerbi from "powerbi-visuals-api";
import { AxisConfig, GasRecord } from "../config";

export interface ParsedDataPoint {
    date: Date;
    values: GasRecord;
}

/**
 * Generalized extraction engine that maps PowerBI data columns 
 * to dynamic axes defined in config.
 */
export function parseData(dataView: powerbi.DataView, axes: AxisConfig[]): ParsedDataPoint[] {
    const table = dataView?.table;
    if (!table || !table.rows || table.rows.length === 0) return [];

    const columns = table.columns;
    
    // Find the primary chronological index
    const dateIndex = columns.findIndex(c => c.roles && c.roles["date"]);
    if (dateIndex === -1) return [];

    // Map axes to their respective column indices
    const axisIndices = axes.map(axis => ({
        key: axis.key,
        index: columns.findIndex(c => c.roles && c.roles[axis.key])
    }));

    // Prevent rendering if any required axis mapping is missing
    if (axisIndices.some(a => a.index === -1)) return [];

    const data: ParsedDataPoint[] = table.rows.map(row => {
        const values: GasRecord = {};
        axisIndices.forEach(axis => {
            values[axis.key] = Number(row[axis.index]) || 0;
        });

        return {
            date: new Date(row[dateIndex] as string),
            values
        };
    });

    data.sort((a, b) => a.date.getTime() - b.date.getTime());

    return data;
}