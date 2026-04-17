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

export interface RegionConfig {
    key: FaultType;
    label: string;
    defaultColor: string;
    condition: (g: GasRecord) => boolean;
    vertices?: GasRecord[];
}

export interface RegionLabelConfig {
    key: string;
    gas: GasRecord;
    offset: { x: number; y: number };
    isExternal: boolean;
}

export interface TriangleConfig {
    axes: AxisConfig[];
    regions: RegionConfig[];
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
        regions: [
            {
                key: "PD",
                label: "PD - Partial Discharge",
                defaultColor: FAULT_COLORS.PD,
                condition: (g) => g.ch4 >= 98,
                vertices: [{ch4: 100, c2h4: 0, c2h2: 0}, {ch4: 98, c2h4: 2, c2h2: 0}, {ch4: 98, c2h4: 0, c2h2: 2}]
            },
            {
                key: "T1",
                label: "T1 - Thermal Fault, t < 300°C",
                defaultColor: FAULT_COLORS.T1,
                condition: (g) => g.ch4 < 98 && g.c2h4 < 20 && g.c2h2 < 4,
                vertices: [{ch4: 98, c2h4: 2, c2h2: 0}, {ch4: 80, c2h4: 20, c2h2: 0}, {ch4: 76, c2h4: 20, c2h2: 4}, {ch4: 96, c2h4: 0, c2h2: 4}, {ch4: 98, c2h4: 0, c2h2: 2}]
            },
            {
                key: "T2",
                label: "T2 - Thermal Fault, 300°C < t < 700°C",
                defaultColor: FAULT_COLORS.T2,
                condition: (g) => g.c2h4 >= 20 && g.c2h4 < 50 && g.c2h2 < 4,
                vertices: [{ch4: 80, c2h4: 20, c2h2: 0}, {ch4: 50, c2h4: 50, c2h2: 0}, {ch4: 46, c2h4: 50, c2h2: 4}, {ch4: 76, c2h4: 20, c2h2: 4}]
            },
            {
                key: "T3",
                label: "T3 - Thermal Fault, t > 700°C",
                defaultColor: FAULT_COLORS.T3,
                condition: (g) => g.c2h4 >= 50 && g.c2h2 < 15,
                vertices: [{ch4: 50, c2h4: 50, c2h2: 0}, {ch4: 0, c2h4: 100, c2h2: 0}, {ch4: 0, c2h4: 85, c2h2: 15}, {ch4: 35, c2h4: 50, c2h2: 15}]
            },
            {
                key: "DT",
                label: "DT - Discharge of Thermal Fault",
                defaultColor: FAULT_COLORS.DT,
                condition: (g) => (g.c2h4 < 50 && g.c2h2 >= 4 && g.c2h2 < 13) || (g.c2h4 >= 40 && g.c2h4 < 50 && g.c2h2 >= 13 && g.c2h2 < 29) || (g.c2h4 >= 50 && g.c2h2 >= 15 && g.c2h2 < 29),
                vertices: [{ch4: 96, c2h4: 0, c2h2: 4}, {ch4: 46, c2h4: 50, c2h2: 4}, {ch4: 35, c2h4: 50, c2h2: 15}, {ch4: 0, c2h4: 85, c2h2: 15}, {ch4: 0, c2h4: 71, c2h2: 29}, {ch4: 21, c2h4: 50, c2h2: 29}, {ch4: 31, c2h4: 40, c2h2: 29}, {ch4: 47, c2h4: 40, c2h2: 13}, {ch4: 87, c2h4: 0, c2h2: 13}]
            },
            {
                key: "D1",
                label: "D1 - Discharge of Low Energy (Sparking)",
                defaultColor: FAULT_COLORS.D1,
                condition: (g) => g.c2h4 < 23 && g.c2h2 >= 13,
                vertices: [{ch4: 87, c2h4: 0, c2h2: 13}, {ch4: 64, c2h4: 23, c2h2: 13}, {ch4: 0, c2h4: 23, c2h2: 77}, {ch4: 0, c2h4: 0, c2h2: 100}]
            },
            {
                key: "D2",
                label: "D2 - Discharge of High Energy (Arcing)",
                defaultColor: FAULT_COLORS.D2,
                condition: (g) => (g.c2h4 >= 23 && g.c2h2 >= 29) || (g.c2h4 >= 23 && g.c2h4 < 40 && g.c2h2 >= 13 && g.c2h2 < 29),
                vertices: [{ch4: 64, c2h4: 23, c2h2: 13}, {ch4: 47, c2h4: 40, c2h2: 13}, {ch4: 31, c2h4: 40, c2h2: 29}, {ch4: 0, c2h4: 71, c2h2: 29}, {ch4: 0, c2h4: 23, c2h2: 77}]
            }
        ],
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
        regions: [
            {
                key: "PD" as FaultType,
                label: "PD - Partial Discharge",
                defaultColor: FAULT_COLORS.PD,
                condition: (g) => g.ch4 >= 2 && g.ch4 < 15 && g.c2h6 < 1,
                vertices: [{h2: 98, c2h6: 0, ch4: 2}, {h2: 85, c2h6: 0, ch4: 15}, {h2: 84, c2h6: 1, ch4: 15}, {h2: 97, c2h6: 1, ch4: 2}]
            },
            {
                key: "S" as FaultType,
                label: "S - Stray Gassing",
                defaultColor: FAULT_COLORS.S,
                condition: (g) => 
                    (g.h2 >= 9 && g.c2h6 >= 30 && g.c2h6 < 46) || 
                    (g.h2 >= 15 && g.c2h6 >= 24 && g.c2h6 < 30) || 
                    (g.ch4 < 36 && g.c2h6 >= 1 && g.c2h6 < 24) || 
                    (g.ch4 >= 15 && g.ch4 < 36 && g.c2h6 < 1) || 
                    (g.ch4 < 2 && g.c2h6 < 1),
                vertices: [{h2: 100, c2h6: 0, ch4: 0}, {h2: 98, c2h6: 0, ch4: 2}, {h2: 97, c2h6: 1, ch4: 2}, {h2: 84, c2h6: 1, ch4: 15}, {h2: 85, c2h6: 0, ch4: 15}, {h2: 64, c2h6: 0, ch4: 36}, {h2: 40, c2h6: 24, ch4: 36}, {h2: 15, c2h6: 24, ch4: 61}, {h2: 15, c2h6: 30, ch4: 55}, {h2: 9, c2h6: 30, ch4: 61}, {h2: 9, c2h6: 46, ch4: 45}, {h2: 54, c2h6: 46, ch4: 0}]
            },
            {
                key: "O" as FaultType,
                label: "O - Overheating",
                defaultColor: FAULT_COLORS.O,
                condition: (g) => g.h2 < 9 && g.c2h6 >= 30,
                vertices: [{h2: 9, c2h6: 30, ch4: 61}, {h2: 9, c2h6: 91, ch4: 0}, {h2: 0, c2h6: 100, ch4: 0}, {h2: 0, c2h6: 30, ch4: 70}]
            },
            {
                key: "C" as FaultType,
                label: "C - Carbonization",
                defaultColor: FAULT_COLORS.C,
                condition: (g) => g.ch4 >= 36 || (g.h2 < 15 && g.c2h6 >= 24 && g.c2h6 < 30),
                vertices: [{h2: 64, c2h6: 0, ch4: 36}, {h2: 0, c2h6: 0, ch4: 100}, {h2: 0, c2h6: 30, ch4: 70}, {h2: 15, c2h6: 30, ch4: 55}, {h2: 15, c2h6: 24, ch4: 61}, {h2: 40, c2h6: 24, ch4: 36}]
            },
            {
                key: "ND" as FaultType,
                label: "ND - Not Determined",
                defaultColor: FAULT_COLORS.ND,
                condition: (g) => g.h2 >= 9 && g.c2h6 >= 46,
                vertices: [{h2: 9, c2h6: 46, ch4: 45}, {h2: 9, c2h6: 91, ch4: 0}, {h2: 54, c2h6: 46, ch4: 0}]
            }
        ],
        regionLabels: [
            // External label for the tiny Partial Discharge tip
            { key: "PD", gas: { h2: 91, ch4: 9, c2h6: 0 }, offset: { x: 40, y: 0 }, isExternal: true },
            
            // Centered internal labels
            { key: "S", gas: { h2: 60, ch4: 20, c2h6: 20 }, offset: { x: 0, y: 0 }, isExternal: false },
            { key: "C", gas: { h2: 30, ch4: 60, c2h6: 10 }, offset: { x: 0, y: 0 }, isExternal: false },
            { key: "O", gas: { h2: 5, ch4: 31, c2h6: 64 }, offset: { x: 0, y: 0 }, isExternal: false },
            
            // ND (Not Determined) - IEC standard zone in the bottom left corner
            { key: "ND", gas: { h2: 30, ch4: 10, c2h6: 60 }, offset: { x: 0, y: 0 }, isExternal: false }
        ]
    },
    "5": {
        axes: [
            { key: "ch4", label: "% CH₄" },
            { key: "c2h4", label: "% C₂H₄" },
            { key: "c2h6", label: "% C₂H₆" }
        ],
        regions: [
            {
                key: "PD" as FaultType,
                label: "PD - Partial Discharge",
                defaultColor: FAULT_COLORS.PD,
                condition: (g) => g.c2h4 < 1 && g.c2h6 >= 2 && g.c2h6 < 14,
                vertices: [{ch4: 98, c2h6: 2, c2h4: 0}, {ch4: 86, c2h6: 14, c2h4: 0}, {ch4: 85, c2h6: 14, c2h4: 1}, {ch4: 97, c2h6: 2, c2h4: 1}]
            },
            {
                key: "O" as FaultType,
                label: "O - Overheating",
                defaultColor: FAULT_COLORS.O,
                condition: (g) => (g.c2h4 >= 1 && g.c2h4 < 10 && g.c2h6 >= 2 && g.c2h6 < 14) || (g.c2h4 < 1 && g.c2h6 < 2),
                vertices: [{ch4: 100, c2h6: 0, c2h4: 0}, {ch4: 98, c2h6: 2, c2h4: 0}, {ch4: 97, c2h6: 2, c2h4: 1}, {ch4: 85, c2h6: 14, c2h4: 1}, {ch4: 76, c2h6: 14, c2h4: 10}, {ch4: 90, c2h6: 0, c2h4: 10}]
            },
            {
                key: "O" as FaultType, // Split to prevent drawing a crossing line over the canvas
                label: "O - Overheating",
                defaultColor: FAULT_COLORS.O,
                condition: (g) => g.c2h4 < 10 && g.c2h6 >= 54,
                vertices: [{ch4: 46, c2h6: 54, c2h4: 0}, {ch4: 0, c2h6: 100, c2h4: 0}, {ch4: 0, c2h6: 90, c2h4: 10}, {ch4: 36, c2h6: 54, c2h4: 10}]
            },
            {
                key: "S" as FaultType,
                label: "S - Stray Gassing",
                defaultColor: FAULT_COLORS.S,
                condition: (g) => g.c2h4 < 10 && g.c2h6 >= 14 && g.c2h6 < 54,
                vertices: [{ch4: 86, c2h6: 14, c2h4: 0}, {ch4: 46, c2h6: 54, c2h4: 0}, {ch4: 36, c2h6: 54, c2h4: 10}, {ch4: 76, c2h6: 14, c2h4: 10}]
            },
            {
                key: "T2" as FaultType,
                label: "T2 - Thermal Fault",
                defaultColor: FAULT_COLORS.T2,
                condition: (g) => g.c2h4 >= 10 && g.c2h4 < 35 && g.c2h6 < 12,
                vertices: [{ch4: 90, c2h6: 0, c2h4: 10}, {ch4: 78, c2h6: 12, c2h4: 10}, {ch4: 53, c2h6: 12, c2h4: 35}, {ch4: 65, c2h6: 0, c2h4: 35}]
            },
            {
                key: "T3" as FaultType,
                label: "T3 - Thermal Fault",
                defaultColor: FAULT_COLORS.T3,
                condition: (g) => (g.c2h4 >= 35 && g.c2h6 < 12) || (g.c2h4 >= 50 && g.c2h6 >= 12 && g.c2h6 < 14) || (g.c2h4 >= 70 && g.c2h6 >= 14) || (g.c2h4 >= 35 && g.c2h6 >= 30),
                vertices: [{ch4: 65, c2h6: 0, c2h4: 35}, {ch4: 53, c2h6: 12, c2h4: 35}, {ch4: 38, c2h6: 12, c2h4: 50}, {ch4: 36, c2h6: 14, c2h4: 50}, {ch4: 16, c2h6: 14, c2h4: 70}, {ch4: 0, c2h6: 30, c2h4: 70}, {ch4: 35, c2h6: 30, c2h4: 35}, {ch4: 0, c2h6: 65, c2h4: 35}, {ch4: 0, c2h6: 0, c2h4: 100}]
            },
            {
                key: "C" as FaultType,
                label: "C - Carbonization",
                defaultColor: FAULT_COLORS.C, 
                condition: (g) => (g.c2h4 >= 10 && g.c2h4 < 50 && g.c2h6 >= 12 && g.c2h6 < 14) || (g.c2h4 >= 10 && g.c2h4 < 70 && g.c2h6 >= 14 && g.c2h6 < 30),
                vertices: [{ch4: 78, c2h6: 12, c2h4: 10}, {ch4: 76, c2h6: 14, c2h4: 10}, {ch4: 60, c2h6: 30, c2h4: 10}, {ch4: 0, c2h6: 30, c2h4: 70}, {ch4: 16, c2h6: 14, c2h4: 70}, {ch4: 36, c2h6: 14, c2h4: 50}, {ch4: 38, c2h6: 12, c2h4: 50}]
            },
            {
                key: "ND" as FaultType,
                label: "ND - Not Determined",
                defaultColor: FAULT_COLORS.ND,
                condition: (g) => g.c2h4 >= 10 && g.c2h4 < 35 && g.c2h6 >= 30,
                vertices: [{ch4: 60, c2h6: 30, c2h4: 10}, {ch4: 0, c2h6: 90, c2h4: 10}, {ch4: 0, c2h6: 65, c2h4: 35}, {ch4: 35, c2h6: 30, c2h4: 35}]
            }
        ],
        regionLabels: [
            // External label for the tiny Partial Discharge tip (pulled to the left based on your image)
            { key: "PD", gas: { ch4: 95, c2h4: 0, c2h6: 5 }, offset: { x: -40, y: 0 }, isExternal: true },
            
            // The split 'O' (Overheating) regions
            { key: "O", gas: { ch4: 90, c2h4: 5, c2h6: 5 }, offset: { x: 0, y: 0 }, isExternal: false }, // Top O
            { key: "O", gas: { ch4: 15, c2h4: 4.5, c2h6: 80.5 }, offset: { x: 0, y: 0 }, isExternal: false }, // Bottom Left O
            
            // The split 'T3' (Thermal Fault > 700C) regions
            { key: "T3", gas: { ch4: 15, c2h4: 74.5, c2h6: 10.5 }, offset: { x: 0, y: 0 }, isExternal: false }, // Bottom Right T3
            { key: "T3", gas: { ch4: 15, c2h4: 45, c2h6: 40 }, offset: { x: 0, y: 0 }, isExternal: false }, // Bottom Center T3
            
            // Standard internal labels
            { key: "S", gas: { ch4: 64.5, c2h4: 5.5, c2h6: 30 }, offset: { x: 0, y: 0 }, isExternal: false },
            { key: "T2", gas: { ch4: 64.5, c2h4: 30, c2h6: 5.5 }, offset: { x: 0, y: 0 }, isExternal: false },
            { key: "C", gas: { ch4: 40, c2h4: 40, c2h6: 20 }, offset: { x: 0, y: 0 }, isExternal: false },
            
            // ND (Not Determined) - IEC standard zone
            { key: "ND", gas: { ch4: 15, c2h4: 22, c2h6: 63 }, offset: { x: 0, y: 0 }, isExternal: false }
        ]
    }
};