import { BoundaryShifter } from "../tools/TestUtils";

export const T5_BOUNDARY_SCENARIOS = [
    // --- JUNCTIONS (3-WAY) ---
    BoundaryShifter.generateVariants("O_S_C", { ch4: 76, c2h4: 10, c2h6: 14 }, "C", [
        { suffix: "O", expected: "O", delta: { ch4: 0.2, c2h4: -0.1, c2h6: -0.1 } }, 
        { suffix: "S", expected: "S", delta: { ch4: 0, c2h4: -0.1, c2h6: 0.1 } },
        { suffix: "C", expected: "C", delta: { ch4: -0.2, c2h4: 0.1, c2h6: 0.1 } },
    ]),
    BoundaryShifter.generateVariants("O_T2_C", { ch4: 78, c2h4: 10, c2h6: 12 }, "C", [
        { suffix: "O", expected: "O", delta: { ch4: 0, c2h4: -0.1, c2h6: 0.1 } }, 
        { suffix: "T2", expected: "T2", delta: { ch4: 0, c2h4: 0.1, c2h6: -0.1 } },
        { suffix: "C", expected: "C", delta: { ch4: -0.2, c2h4: 0.1, c2h6: 0.1 } },
    ]),
    BoundaryShifter.generateVariants("O_S_ND", { ch4: 36, c2h4: 10, c2h6: 54 }, "ND", [
        { suffix: "O", expected: "O", delta: { ch4: 0, c2h4: -0.1, c2h6: 0.1 } },
        { suffix: "S", expected: "S", delta: { ch4: 0.2, c2h4: -0.1, c2h6: -0.1 } },
        { suffix: "ND", expected: "ND", delta: { ch4: -0.2, c2h4: 0.1, c2h6: 0.1 } },
    ]),
    BoundaryShifter.generateVariants("S_ND_C", { ch4: 60, c2h4: 10, c2h6: 30 }, "ND", [
        { suffix: "S", expected: "S", delta: { ch4: 0, c2h4: -0.1, c2h6: 0.1 } },
        { suffix: "ND", expected: "ND", delta: { ch4: -0.2, c2h4: 0.1, c2h6: 0.1 } },
        { suffix: "C", expected: "C", delta: { ch4: 0, c2h4: 0.1, c2h6: -0.1 } },
    ]),
    BoundaryShifter.generateVariants("C_T2_T3", { ch4: 53, c2h4: 35, c2h6: 12 }, "C", [
        { suffix: "T2", expected: "T2", delta: { ch4: 0.2, c2h4: -0.1, c2h6: -0.1 } },
        { suffix: "T3", expected: "T3", delta: { ch4: 0, c2h4: 0.1, c2h6: -0.1 } },
        { suffix: "C", expected: "C", delta: { ch4: -0.2, c2h4: 0.1, c2h6: 0.1 } },
    ]),
    BoundaryShifter.generateVariants("C_ND_T3", { ch4: 35, c2h4: 35, c2h6: 30 }, "T3", [
        { suffix: "C", expected: "C", delta: { ch4: 0.2, c2h4: -0.1, c2h6: -0.1 } },
        { suffix: "ND", expected: "ND", delta: { ch4: 0, c2h4: -0.1, c2h6: 0.1 } },
        { suffix: "T3", expected: "T3", delta: { ch4: -0.2, c2h4: 0.1, c2h6: 0.1 } },
    ]),
    BoundaryShifter.generateVariants("PD_O_S", { ch4: 85, c2h4: 1, c2h6: 14 }, "S", [
        { suffix: "PD", expected: "PD", delta: { ch4: 0.2, c2h4: -0.1, c2h6: -0.1 } },
        { suffix: "O", expected: "O", delta: { ch4: 0.1, c2h4: 0.1, c2h6: -0.2 } }, 
        { suffix: "S", expected: "S", delta: { ch4: -0.1, c2h4: 0, c2h6: 0.1 } }, 
    ]),

    // --- STANDARD BOUNDARIES (2-WAY) ---
    BoundaryShifter.generateVariants("O_S_1", { ch4: 81, c2h4: 5, c2h6: 14 }, "S", [
        { suffix: "O", expected: "O", delta: { ch4: 0.1, c2h4: 0, c2h6: -0.1 } },
        { suffix: "S", expected: "S", delta: { ch4: -0.1, c2h4: 0, c2h6: 0.1 } },
    ]),
    BoundaryShifter.generateVariants("O_S_2", { ch4: 41, c2h4: 5, c2h6: 54 }, "O", [
        { suffix: "S", expected: "S", delta: { ch4: 0.1, c2h4: 0, c2h6: -0.1 } },
        { suffix: "O", expected: "O", delta: { ch4: -0.1, c2h4: 0, c2h6: 0.1 } },
    ]),
    BoundaryShifter.generateVariants("PD_O_1", { ch4: 97.5, c2h4: 0.5, c2h6: 2 }, "PD", [
        { suffix: "PD", expected: "PD", delta: { ch4: -0.1, c2h4: 0, c2h6: 0.1 } },
        { suffix: "O", expected: "O", delta: { ch4: 0.1, c2h4: 0, c2h6: -0.1 } }, 
    ]),
    BoundaryShifter.generateVariants("PD_O_2", { ch4: 91, c2h4: 1, c2h6: 8 }, "O", [
        { suffix: "PD", expected: "PD", delta: { ch4: 0, c2h4: -0.1, c2h6: 0.1 } },
        { suffix: "O", expected: "O", delta: { ch4: 0, c2h4: 0.1, c2h6: -0.1 } }, 
    ]),
    BoundaryShifter.generateVariants("PD_S", { ch4: 85.5, c2h4: 0.5, c2h6: 14 }, "S", [
        { suffix: "PD", expected: "PD", delta: { ch4: 0.1, c2h4: 0, c2h6: -0.1 } },
        { suffix: "S", expected: "S", delta: { ch4: -0.1, c2h4: 0, c2h6: 0.1 } }, 
    ]),
    BoundaryShifter.generateVariants("O_ND", { ch4: 30, c2h4: 10, c2h6: 60 }, "ND", [
        { suffix: "O", expected: "O", delta: { ch4: 0.1, c2h4: -0.1, c2h6: 0 } },
        { suffix: "ND", expected: "ND", delta: { ch4: -0.1, c2h4: 0.1, c2h6: 0 } },
    ]),
    BoundaryShifter.generateVariants("O_ND", { ch4: 15, c2h4: 10, c2h6: 75 }, "ND", [
        { suffix: "O", expected: "O", delta: { ch4: 0.1, c2h4: -0.1, c2h6: 0 } },
        { suffix: "ND", expected: "ND", delta: { ch4: -0.1, c2h4: 0.1, c2h6: 0 } },
    ]),
    BoundaryShifter.generateVariants("S_ND", { ch4: 50, c2h4: 10, c2h6: 40 }, "ND", [
        { suffix: "S", expected: "S", delta: { ch4: 0.1, c2h4: -0.1, c2h6: 0 } },
        { suffix: "ND", expected: "ND", delta: { ch4: -0.1, c2h4: 0.1, c2h6: 0 } },
    ]),
    BoundaryShifter.generateVariants("S_C", { ch4: 70, c2h4: 10, c2h6: 20 }, "C", [
        { suffix: "S", expected: "S", delta: { ch4: 0.1, c2h4: -0.1, c2h6: 0 } },
        { suffix: "C", expected: "C", delta: { ch4: -0.1, c2h4: 0.1, c2h6: 0 } },
    ]),
    BoundaryShifter.generateVariants("O_C", { ch4: 77, c2h4: 10, c2h6: 13 }, "C", [
        { suffix: "O", expected: "O", delta: { ch4: 0.1, c2h4: -0.1, c2h6: 0 } },
        { suffix: "C", expected: "C", delta: { ch4: -0.1, c2h4: 0.1, c2h6: 0 } },
    ]),
    BoundaryShifter.generateVariants("O_T2", { ch4: 85, c2h4: 10, c2h6: 5 }, "T2", [
        { suffix: "O", expected: "O", delta: { ch4: 0.1, c2h4: -0.1, c2h6: 0 } },
        { suffix: "T2", expected: "T2", delta: { ch4: -0.1, c2h4: 0.1, c2h6: 0 } },
    ]),
    BoundaryShifter.generateVariants("T2_C", { ch4: 73, c2h4: 15, c2h6: 12 }, "C", [
        { suffix: "T2", expected: "T2", delta: { ch4: 0.1, c2h4: 0, c2h6: -0.1 } },
        { suffix: "C", expected: "C", delta: { ch4: -0.1, c2h4: 0, c2h6: 0.1 } },
    ]),
    BoundaryShifter.generateVariants("C_ND", { ch4: 50, c2h4: 20, c2h6: 30 }, "ND", [
        { suffix: "C", expected: "C", delta: { ch4: 0.1, c2h4: 0, c2h6: -0.1 } },
        { suffix: "ND", expected: "ND", delta: { ch4: -0.1, c2h4: 0, c2h6: 0.1 } },
    ]),
    BoundaryShifter.generateVariants("C_T2", { ch4: 63, c2h4: 25, c2h6: 12 }, "C", [
        { suffix: "T2", expected: "T2", delta: { ch4: 0.1, c2h4: 0, c2h6: -0.1 } },
        { suffix: "C", expected: "C", delta: { ch4: -0.1, c2h4: 0, c2h6: 0.1 } },
    ]),
    BoundaryShifter.generateVariants("ND_T3", { ch4: 20, c2h4: 35, c2h6: 45 }, "T3", [
        { suffix: "ND", expected: "ND", delta: { ch4: 0, c2h4: -0.1, c2h6: 0.1 } },
        { suffix: "T3", expected: "T3", delta: { ch4: 0, c2h4: 0.1, c2h6: -0.1 } },
    ]),

    // --- C & T3 ZIG-ZAG BOUNDARIES ---
    BoundaryShifter.generateVariants("C_T3_1", { ch4: 37, c2h4: 50, c2h6: 13 }, "T3", [
        { suffix: "C", expected: "C", delta: { ch4: 0.1, c2h4: -0.1, c2h6: 0 } },
        { suffix: "T3", expected: "T3", delta: { ch4: -0.1, c2h4: 0.1, c2h6: 0 } },
    ]),
    BoundaryShifter.generateVariants("C_T3_2", { ch4: 26, c2h4: 60, c2h6: 14 }, "C", [
        { suffix: "T3", expected: "T3", delta: { ch4: 0.1, c2h4: 0, c2h6: -0.1 } },
        { suffix: "C", expected: "C", delta: { ch4: -0.1, c2h4: 0, c2h6: 0.1 } },
    ]),
    BoundaryShifter.generateVariants("C_T3_3", { ch4: 8, c2h4: 70, c2h6: 22 }, "T3", [
        { suffix: "C", expected: "C", delta: { ch4: 0.1, c2h4: -0.1, c2h6: 0 } },
        { suffix: "T3", expected: "T3", delta: { ch4: -0.1, c2h4: 0.1, c2h6: 0 } },
    ]),
    BoundaryShifter.generateVariants("C_T3_4", { ch4: 20, c2h4: 50, c2h6: 30 }, "T3", [
        { suffix: "C", expected: "C", delta: { ch4: 0.1, c2h4: 0, c2h6: -0.1 } },
        { suffix: "T3", expected: "T3", delta: { ch4: -0.1, c2h4: 0, c2h6: 0.1 } },
    ]),
    BoundaryShifter.generateVariants("C_T3_5", { ch4: 30, c2h4: 40, c2h6: 30 }, "T3", [
        { suffix: "C", expected: "C", delta: { ch4: 0.1, c2h4: 0, c2h6: -0.1 } },
        { suffix: "T3", expected: "T3", delta: { ch4: -0.1, c2h4: 0, c2h6: 0.1 } },
    ]),

    // --- C & T3 CORNERS ---
    BoundaryShifter.generateVariants("C_T3_corner_1", { ch4: 36, c2h4: 50, c2h6: 14 }, "C", [
        { suffix: "C", expected: "C", delta: { ch4: 0, c2h4: -0.1, c2h6: 0.1 } }, 
        { suffix: "T3", expected: "T3", delta: { ch4: 0, c2h4: 0.1, c2h6: -0.1 } }, 
    ]),
    BoundaryShifter.generateVariants("C_T3_corner_2", { ch4: 16, c2h4: 70, c2h6: 14 }, "T3", [
        { suffix: "C", expected: "C", delta: { ch4: 0, c2h4: -0.1, c2h6: 0.1 } }, 
        { suffix: "T3", expected: "T3", delta: { ch4: -0.2, c2h4: 0.1, c2h6: 0.1 } }, 
    ]),
    BoundaryShifter.generateVariants("C_T3_corner_3", { ch4: 0, c2h4: 70, c2h6: 30 }, "T3", [
        { suffix: "C", expected: "C", delta: { ch4: 0.2, c2h4: -0.1, c2h6: -0.1 } }, 
        { suffix: "T3", expected: "T3", delta: { ch4: -0.2, c2h4: 0.1, c2h6: 0.1 } }, 
    ]),
    BoundaryShifter.generateVariants("C_T3_corner_4", { ch4: 35, c2h4: 35, c2h6: 30 }, "T3", [
        { suffix: "C", expected: "C", delta: { ch4: 0.2, c2h4: -0.1, c2h6: -0.1 } }, 
        { suffix: "T3", expected: "T3", delta: { ch4: -0.2, c2h4: 0.1, c2h6: 0.1 } }, 
    ]),

    BoundaryShifter.generateVariants("PD_O_corner", { ch4: 97, c2h4: 1, c2h6: 2 }, "O", [
        { suffix: "PD", expected: "PD", delta: { ch4: 0, c2h4: -0.1, c2h6: 0.1 } },
        { suffix: "O", expected: "O", delta: { ch4: 0, c2h4: 0.1, c2h6: -0.1 } },
    ]),
];