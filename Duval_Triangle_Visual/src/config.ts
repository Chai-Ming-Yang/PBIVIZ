export type FaultType = "PD" | "T1" | "T2" | "T3" | "DT" | "D1" | "D2" | "S" | "O" | "C" | "ND" | "Unknown";

export const FAULT_COLORS: Record<FaultType, string> = {
    "PD": "#fff2de",
    "T1": "#f2d0b8",
    "T2": "#d6f5e3",
    "T3": "#bcd9bc",
    "DT": "#bbd2ed",
    "D1": "#ccc2dd",
    "D2": "#cfebf7",
    "S": "#ffcce6",
    "O": "#d8bfd8",
    "C": "#b2dfdb",
    "ND": "#ffffff",
    "Unknown": "#ffffff"
};

export type GasRecord = Record<string, number>;

export interface AxisConfig {
    key: string;
    label: string;
}

export interface RegionLabelConfig {
    key: FaultType;
    gas: GasRecord;
    offset: { x: number; y: number };
    isExternal: boolean;
}

export interface TriangleConfig {
    axes: AxisConfig[];
    regions: FaultType[];
    regionLabels: RegionLabelConfig[];
}

export const GLOBAL_CONFIG = {
    zoom: {
        min: 0.5,
        max: 5,
        default: 1
    },
    declutterThreshold: 15
};

export const TRIANGLE_CONFIGS: Record<string, TriangleConfig> = {
    "1": {
        axes: [
            { key: "ch4", label: "% CH₄" },
            { key: "c2h4", label: "% C₂H₄" },
            { key: "c2h2", label: "% C₂H₂" }
        ],
        regions: ["PD", "T1", "T2", "T3", "DT", "D1", "D2"],
        regionLabels: [
            { key: "D1", gas: { ch4: 20, c2h4: 10, c2h2: 70 }, offset: { x: 0, y: 0 }, isExternal: false },
            { key: "D2", gas: { ch4: 20, c2h4: 35, c2h2: 45 }, offset: { x: 0, y: 0 }, isExternal: false },
            { key: "DT", gas: { ch4: 20, c2h4: 58, c2h2: 22 }, offset: { x: 0, y: 0 }, isExternal: false },
            { key: "T3", gas: { ch4: 20, c2h4: 73, c2h2: 7 }, offset: { x: 0, y: 0 }, isExternal: false },
            { key: "PD", gas: { ch4: 99, c2h4: 1, c2h2: 0 }, offset: { x: 60, y: 0 }, isExternal: true },
            { key: "T1", gas: { ch4: 90, c2h4: 12, c2h2: 0 }, offset: { x: 60, y: 0 }, isExternal: true },
            { key: "T2", gas: { ch4: 68, c2h4: 37, c2h2: 0 }, offset: { x: 60, y: 0 }, isExternal: true }
        ]
    },
    "4": {
        axes: [
            { key: "h2", label: "% H₂" },
            { key: "ch4", label: "% CH₄" },
            { key: "c2h6", label: "% C₂H₆" }
        ],
        regions: ["PD", "S", "O", "C", "ND"],
        regionLabels: [
            { key: "PD", gas: { h2: 91, ch4: 9, c2h6: 0 }, offset: { x: 40, y: 0 }, isExternal: true },
            { key: "S", gas: { h2: 60, ch4: 20, c2h6: 20 }, offset: { x: 0, y: 0 }, isExternal: false },
            { key: "C", gas: { h2: 30, ch4: 60, c2h6: 10 }, offset: { x: 0, y: 0 }, isExternal: false },
            { key: "O", gas: { h2: 5, ch4: 31, c2h6: 64 }, offset: { x: 0, y: 0 }, isExternal: false },
            { key: "ND", gas: { h2: 30, ch4: 10, c2h6: 60 }, offset: { x: 0, y: 0 }, isExternal: false }
        ]
    },
    "5": {
        axes: [
            { key: "ch4", label: "% CH₄" },
            { key: "c2h4", label: "% C₂H₄" },
            { key: "c2h6", label: "% C₂H₆" }
        ],
        regions: ["PD", "O", "S", "T2", "T3", "C", "ND"],
        regionLabels: [
            { key: "PD", gas: { ch4: 95, c2h4: 0, c2h6: 5 }, offset: { x: -40, y: 0 }, isExternal: true },
            { key: "O", gas: { ch4: 90, c2h4: 5, c2h6: 5 }, offset: { x: 0, y: 0 }, isExternal: false },
            { key: "O", gas: { ch4: 15, c2h4: 4.5, c2h6: 80.5 }, offset: { x: 0, y: 0 }, isExternal: false },
            { key: "T3", gas: { ch4: 15, c2h4: 74.5, c2h6: 10.5 }, offset: { x: 0, y: 0 }, isExternal: false },
            { key: "T3", gas: { ch4: 15, c2h4: 45, c2h6: 40 }, offset: { x: 0, y: 0 }, isExternal: false },
            { key: "S", gas: { ch4: 64.5, c2h4: 5.5, c2h6: 30 }, offset: { x: 0, y: 0 }, isExternal: false },
            { key: "T2", gas: { ch4: 64.5, c2h4: 30, c2h6: 5.5 }, offset: { x: 0, y: 0 }, isExternal: false },
            { key: "C", gas: { ch4: 40, c2h4: 40, c2h6: 20 }, offset: { x: 0, y: 0 }, isExternal: false },
            { key: "ND", gas: { ch4: 15, c2h4: 22, c2h6: 63 }, offset: { x: 0, y: 0 }, isExternal: false }
        ]
    }
};