import { FaultType, FAULT_COLORS } from "./utils/faultSpecifications";

export type GasRecord = Record<string, number>;

export interface AxisConfig {
    key: string;
    label: string;
}

export interface RegionConfig {
    key: FaultType;
    label: string;
    defaultColor: string;
    labelOffset?: { x: number; y: number };
    isExternal?: boolean;
}

export interface RegionLabelConfig {
    key: string;
    offset: { x: number; y: number };
    isExternal: boolean;
}

export interface PentagonConfig {
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

export const DUVAL_AXIS_VERTICES = [
    { x: 0, y: 100 },       // H2
    { x: 95.1, y: 30.9 },   // C2H2
    { x: 58.8, y: -80.9 },  // C2H4
    { x: -58.8, y: -80.9 }, // CH4
    { x: -95.1, y: 30.9 }   // C2H6
];

export const PENTAGON_CONFIGS: Record<string, PentagonConfig> = {
    "P1": {
        axes: [
            { key: "h2", label: "% H₂" },
            { key: "c2h2", label: "% C₂H₂" },
            { key: "c2h4", label: "% C₂H₄" },
            { key: "ch4", label: "% CH₄" },
            { key: "c2h6", label: "% C₂H₆" }
        ],
        regions: [
            { key: "PD", label: "PD - Partial Discharge", defaultColor: FAULT_COLORS.PD },
            { key: "D1", label: "D1 - Discharge of Low Energy", defaultColor: FAULT_COLORS.D1 },
            { key: "D2", label: "D2 - Discharge of High Energy", defaultColor: FAULT_COLORS.D2 },
            { key: "T3", label: "T3 - Thermal Fault, t > 700°C", defaultColor: FAULT_COLORS.T3 },
            { key: "T2", label: "T2 - Thermal Fault, 300°C < t < 700°C", defaultColor: FAULT_COLORS.T2 },
            { key: "T1", label: "T1 - Thermal Fault, t < 300°C", defaultColor: FAULT_COLORS.T1 },
            { key: "S", label: "S - Stray Gassing", defaultColor: FAULT_COLORS.S }
        ],
        regionLabels: [
            { key: "PD", offset: { x: -30, y: 0 }, isExternal: true },
            { key: "D1", offset: { x: 0, y: 0 }, isExternal: false },
            { key: "D2", offset: { x: 0, y: 0 }, isExternal: false },
            { key: "T3", offset: { x: 0, y: 0 }, isExternal: false },
            { key: "T2", offset: { x: 0, y: 0 }, isExternal: false },
            { key: "T1", offset: { x: 0, y: 0 }, isExternal: false },
            { key: "S", offset: { x: 0, y: 0 }, isExternal: false }
        ]
    },
    "P2": {
        axes: [
            { key: "h2", label: "% H₂" },
            { key: "c2h2", label: "% C₂H₂" },
            { key: "c2h4", label: "% C₂H₄" },
            { key: "ch4", label: "% CH₄" },
            { key: "c2h6", label: "% C₂H₆" }
        ],
        regions: [
            { key: "PD", label: "PD - Partial Discharge", defaultColor: FAULT_COLORS.PD },
            { key: "D1", label: "D1 - Discharge of Low Energy", defaultColor: FAULT_COLORS.D1 },
            { key: "D2", label: "D2 - Discharge of High Energy", defaultColor: FAULT_COLORS.D2 },
            { key: "S", label: "S - Stray Gassing", defaultColor: FAULT_COLORS.S },
            { key: "O", label: "O - Overheating", defaultColor: FAULT_COLORS.O },
            { key: "C", label: "C - Carbonization", defaultColor: FAULT_COLORS.C },
            { key: "T3-H", label: "T3-H - Thermal Fault in Oil Only", defaultColor: FAULT_COLORS["T3-H"] }
        ],
        regionLabels: [
            { key: "PD", offset: { x: -30, y: 0 }, isExternal: true },
            { key: "D1", offset: { x: 0, y: 0 }, isExternal: false },
            { key: "D2", offset: { x: 0, y: 0 }, isExternal: false },
            { key: "S", offset: { x: 0, y: 0 }, isExternal: false },
            { key: "O", offset: { x: 0, y: 0 }, isExternal: false },
            { key: "C", offset: { x: 0, y: 0 }, isExternal: false },
            { key: "T3-H", offset: { x: 0, y: 0 }, isExternal: false }
        ]
    }
};