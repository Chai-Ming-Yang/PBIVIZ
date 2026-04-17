import { isPointInPolygon } from "./utils/geometry";

export type FaultType = "PD" | "D1" | "D2" | "T1" | "T2" | "T3" | "T3-H" | "C" | "O" | "S" | "Unknown";

export const FAULT_COLORS: Record<FaultType, string> = {
    "PD": "#fff2de",
    "D1": "#ccc2dd",
    "D2": "#cfebf7",
    "T1": "#f2d0b8",
    "T2": "#d6f5e3",
    "T3": "#bcd9bc",
    "T3-H": "#a8d5a8",
    "C": "#b2dfdb",
    "O": "#d8bfd8",
    "S": "#ffcce6",
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
    // Explicitly typing 'this' ensures TypeScript knows what 'this' refers to inside the condition function
    condition: (this: RegionConfig, g: GasRecord, pt?: { x: number; y: number }) => boolean;
    vertices?: GasRecord[];
    cartesianVertices?: { x: number; y: number }[];
    labelOffset?: { x: number; y: number }; // Added for small regions like PD
    isExternal?: boolean;                   // Flag to draw a pointer line
}

export interface RegionLabelConfig {
    key: string;
    gas: GasRecord;
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
            {
                key: "PD",
                label: "PD - Partial Discharge",
                defaultColor: FAULT_COLORS.PD,
                condition: function(g, pt) { return pt && this.cartesianVertices ? isPointInPolygon(pt, this.cartesianVertices) : false; },
                cartesianVertices: [{x: 0, y: 33}, {x: -1, y: 33}, {x: -1, y: 24.5}, {x: 0, y: 24.5}]
            },
            {
                key: "D1",
                label: "D1 - Discharge of Low Energy",
                defaultColor: FAULT_COLORS.D1,
                condition: function(g, pt) { return pt && this.cartesianVertices ? isPointInPolygon(pt, this.cartesianVertices) : false; },
                cartesianVertices: [{x: 0, y: 40}, {x: 38, y: 12}, {x: 32, y: -6.1}, {x: 4, y: 16}, {x: 0, y: 1.5}]
            },
            {
                key: "D2",
                label: "D2 - Discharge of High Energy",
                defaultColor: FAULT_COLORS.D2,
                condition: function(g, pt) { return pt && this.cartesianVertices ? isPointInPolygon(pt, this.cartesianVertices) : false; },
                cartesianVertices: [{x: 4, y: 16}, {x: 32, y: -6.1}, {x: 24.3, y: -30}, {x: 0, y: -3}, {x: 0, y: 1.5}]
            },
            {
                key: "T3",
                label: "T3 - Thermal Fault, t > 700°C",
                defaultColor: FAULT_COLORS.T3,
                condition: function(g, pt) { return pt && this.cartesianVertices ? isPointInPolygon(pt, this.cartesianVertices) : false; },
                cartesianVertices: [{x: 0, y: -3}, {x: 24.3, y: -30}, {x: 23.5, y: -32.4}, {x: 1, y: -32}, {x: -6, y: -4}]
            },
            {
                key: "T2",
                label: "T2 - Thermal Fault, 300°C < t < 700°C",
                defaultColor: FAULT_COLORS.T2,
                condition: function(g, pt) { return pt && this.cartesianVertices ? isPointInPolygon(pt, this.cartesianVertices) : false; },
                cartesianVertices: [{x: -6, y: -4}, {x: 1, y: -32.4}, {x: -22.5, y: -32.4}]
            },
            {
                key: "T1",
                label: "T1 - Thermal Fault, t < 300°C",
                defaultColor: FAULT_COLORS.T1,
                condition: function(g, pt) { return pt && this.cartesianVertices ? isPointInPolygon(pt, this.cartesianVertices) : false; },
                cartesianVertices: [{x: -6, y: -4}, {x: -22.5, y: -32.4}, {x: -23.5, y: -32.4}, {x: -35, y: 3}, {x: 0, y: 1.5}, {x: 0, y: -3}]
            },
            {
                key: "S",
                label: "S - Stray Gassing",
                defaultColor: FAULT_COLORS.S,
                condition: function(g, pt) { return pt && this.cartesianVertices ? isPointInPolygon(pt, this.cartesianVertices) : false; },
                cartesianVertices: [{x: 0, y: 1.5}, {x: -35, y: 3.1}, {x: -38, y: 12.4}, {x: 0, y: 40}, {x: 0, y: 33}, {x: -1, y: 33}, {x: -1, y: 24.5}, {x: 0, y: 24.5}]
            }
        ],
        regionLabels: [
            { key: "PD", gas: { h2: 84, c2h2: 0, c2h4: 7, ch4: 7, c2h6: 2 }, offset: { x: -30, y: 0 }, isExternal: true },
            { key: "D1", gas: { h2: 45, c2h2: 45, c2h4: 5, ch4: 0, c2h6: 5 }, offset: { x: 0, y: 0 }, isExternal: false },
            { key: "D2", gas: { h2: 0, c2h2: 40, c2h4: 50, ch4: 8, c2h6: 2 }, offset: { x: 0, y: 0 }, isExternal: false },
            { key: "T3", gas: { h2: 0, c2h2: 8, c2h4: 60, ch4: 30, c2h6: 2 }, offset: { x: 0, y: 0 }, isExternal: false },
            { key: "T2", gas: { h2: 0, c2h2: 2, c2h4: 30, ch4: 60, c2h6: 8 }, offset: { x: 0, y: 0 }, isExternal: false },
            { key: "T1", gas: { h2: 5, c2h2: 0, c2h4: 5, ch4: 50, c2h6: 40 }, offset: { x: 0, y: 0 }, isExternal: false },
            { key: "S", gas: { h2: 40, c2h2: 0, c2h4: 0, ch4: 10, c2h6: 50 }, offset: { x: 0, y: 0 }, isExternal: false }
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
            {
                key: "PD",
                label: "PD - Partial Discharge",
                defaultColor: FAULT_COLORS.PD,
                condition: function(g, pt) { return pt && this.cartesianVertices ? isPointInPolygon(pt, this.cartesianVertices) : false; },
                cartesianVertices: [{x: 0, y: 33}, {x: -1, y: 33}, {x: -1, y: 24.5}, {x: 0, y: 24.5}]
            },
            {
                key: "D1",
                label: "D1 - Discharge of Low Energy",
                defaultColor: FAULT_COLORS.D1,
                condition: function(g, pt) { return pt && this.cartesianVertices ? isPointInPolygon(pt, this.cartesianVertices) : false; },
                cartesianVertices: [{x: 0, y: 40}, {x: 38, y: 12}, {x: 32, y: -6.1}, {x: 4, y: 16}, {x: 0, y: 1.5}]
            },
            {
                key: "D2",
                label: "D2 - Discharge of High Energy",
                defaultColor: FAULT_COLORS.D2,
                condition: function(g, pt) { return pt && this.cartesianVertices ? isPointInPolygon(pt, this.cartesianVertices) : false; },
                cartesianVertices: [{x: 4, y: 16}, {x: 32, y: -6.1}, {x: 24.3, y: -30}, {x: 0, y: -3}, {x: 0, y: 1.5}]
            },
            {
                key: "S",
                label: "S - Stray Gassing",
                defaultColor: FAULT_COLORS.S,
                condition: function(g, pt) { return pt && this.cartesianVertices ? isPointInPolygon(pt, this.cartesianVertices) : false; },
                cartesianVertices: [{x: 0, y: 1.5}, {x: -35, y: 3.1}, {x: -38, y: 12.4}, {x: 0, y: 40}, {x: 0, y: 33}, {x: -1, y: 33}, {x: -1, y: 24.5}, {x: 0, y: 24.5}]
            },
            {
                key: "O",
                label: "O - Overheating",
                defaultColor: FAULT_COLORS.O,
                condition: function(g, pt) { return pt && this.cartesianVertices ? isPointInPolygon(pt, this.cartesianVertices) : false; },
                cartesianVertices: [{x: -3.5, y: -3}, {x: -11, y: -8}, {x: -21.5, y: -32.4}, {x: -23.5, y: -32.4}, {x: -35, y: 3.1}, {x: 0, y: 1.5}, {x: 0, y: -3}]
            },
            {
                key: "C",
                label: "C - Carbonization",
                defaultColor: FAULT_COLORS.C,
                condition: function(g, pt) { return pt && this.cartesianVertices ? isPointInPolygon(pt, this.cartesianVertices) : false; },
                cartesianVertices: [{x: -3.5, y: -3}, {x: 2.5, y: -32.4}, {x: -21.5, y: -32.4}, {x: -11, y: -8}]
            },
            {
                key: "T3-H", 
                label: "T3-H - Thermal Fault in Oil Only",
                defaultColor: FAULT_COLORS["T3-H"],
                condition: function(g, pt) { return pt && this.cartesianVertices ? isPointInPolygon(pt, this.cartesianVertices) : false; },
                cartesianVertices: [{x: 0, y: -3}, {x: 24.3, y: -30}, {x: 23.5, y: -32.4}, {x: 2.5, y: -32.4}, {x: -3.5, y: -3}]
            }
        ],
        regionLabels: [
            { key: "PD", gas: { h2: 84, c2h2: 0, c2h4: 7, ch4: 7, c2h6: 2 }, offset: { x: -30, y: 0 }, isExternal: true },
            { key: "D1", gas: { h2: 45, c2h2: 45, c2h4: 5, ch4: 0, c2h6: 5 }, offset: { x: 0, y: 0 }, isExternal: false },
            { key: "D2", gas: { h2: 0, c2h2: 40, c2h4: 50, ch4: 8, c2h6: 2 }, offset: { x: 0, y: 0 }, isExternal: false },
            { key: "S", gas: { h2: 40, c2h2: 0, c2h4: 0, ch4: 10, c2h6: 50 }, offset: { x: 0, y: 0 }, isExternal: false },
            { key: "O", gas: { h2: 5, c2h2: 0, c2h4: 5, ch4: 50, c2h6: 40 }, offset: { x: 0, y: 0 }, isExternal: false },
            { key: "C", gas: { h2: 0, c2h2: 2, c2h4: 30, ch4: 60, c2h6: 8 }, offset: { x: 0, y: 0 }, isExternal: false },
            { key: "T3-H", gas: { h2: 0, c2h2: 8, c2h4: 60, ch4: 30, c2h6: 2 }, offset: { x: 0, y: 0 }, isExternal: false }
        ]
    }
};