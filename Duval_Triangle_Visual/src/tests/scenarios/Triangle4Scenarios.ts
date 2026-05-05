import { BoundaryShifter, TestPoint } from "../tools/TestUtils";

export const T4_BOUNDARY_SCENARIOS: TestPoint[][] = [
    BoundaryShifter.generateVariants("S_C_O", { h2: 9, ch4: 61, c2h6: 30 }, "S", [
        { suffix: "C", expected: "C", delta: { h2: 0, ch4: 0.1, c2h6: -0.1 } },
        { suffix: "S", expected: "S", delta: { h2: 0.1, ch4: -0.2, c2h6: 0.1 } },
        { suffix: "O", expected: "O", delta: { h2: -0.1, ch4: 0, c2h6: 0.1 } }
    ]),
    BoundaryShifter.generateVariants("S_O_ND", { h2: 9, ch4: 45, c2h6: 46 }, "ND", [
        { suffix: "ND", expected: "ND", delta: { h2: 0.1, ch4: -0.2, c2h6: 0.1 } },
        { suffix: "S", expected: "S", delta: { h2: 0.1, ch4: 0, c2h6: -0.1 } },
        { suffix: "O", expected: "O", delta: { h2: -0.1, ch4: 0.1, c2h6: 0 } }
    ]),

    BoundaryShifter.generateVariants("S_C_1", { h2: 52, ch4: 36, c2h6: 12 }, "C", [
        { suffix: "C", expected: "C", delta: { h2: -0.1, ch4: 0.1, c2h6: 0 } },
        { suffix: "S", expected: "S", delta: { h2: 0.1, ch4: -0.1, c2h6: 0 } }
    ]),
    BoundaryShifter.generateVariants("S_C_2", { h2: 30, ch4: 46, c2h6: 24 }, "S", [
        { suffix: "C", expected: "C", delta: { h2: 0, ch4: 0.1, c2h6: -0.1 } },
        { suffix: "S", expected: "S", delta: { h2: 0, ch4: -0.1, c2h6: 0.1 } }
    ]),
    BoundaryShifter.generateVariants("S_C_3", { h2: 15, ch4: 58, c2h6: 27 }, "S", [
        { suffix: "S", expected: "S", delta: { h2: 0.1, ch4: -0.1, c2h6: 0 } },
        { suffix: "C", expected: "C", delta: { h2: -0.1, ch4: 0.1, c2h6: 0 } }
    ]),
    BoundaryShifter.generateVariants("S_C_4", { h2: 12, ch4: 58, c2h6: 30 }, "S", [
        { suffix: "C", expected: "C", delta: { h2: 0, ch4: 0.1, c2h6: -0.1 } },
        { suffix: "S", expected: "S", delta: { h2: 0, ch4: -0.1, c2h6: 0.1 } }
    ]),
    
    BoundaryShifter.generateVariants("S_C_corner_1", { h2: 40, ch4: 36, c2h6: 24 }, "S", [
        { suffix: "C", expected: "C", delta: { h2: 0, ch4: 0.1, c2h6: -0.1 } },
        { suffix: "S", expected: "S", delta: { h2: 0, ch4: -0.1, c2h6: 0.1 } }
    ]),
    BoundaryShifter.generateVariants("S_C_corner_2", { h2: 15, ch4: 61, c2h6: 24 }, "S", [
        { suffix: "C", expected: "C", delta: { h2: -0.1, ch4: 0.2, c2h6: -0.1 } },
        { suffix: "S", expected: "S", delta: { h2: 0.1, ch4: -0.2, c2h6: 0.1 } }
    ]),
    BoundaryShifter.generateVariants("S_C_corner_3", { h2: 15, ch4: 55, c2h6: 30 }, "S", [
        { suffix: "C", expected: "C", delta: { h2: -0.1, ch4: 0.2, c2h6: -0.1 } },
        { suffix: "S", expected: "S", delta: { h2: 0.1, ch4: -0.2, c2h6: 0.1 } }
    ]),

    BoundaryShifter.generateVariants("PD_S_up", { h2: 84.5, ch4: 15, c2h6: 0.5 }, "S", [
        { suffix: "S", expected: "S", delta: { h2: -0.1, ch4: 0.1, c2h6: 0 } },
        { suffix: "PD", expected: "PD", delta: { h2: 0.1, ch4: -0.1, c2h6: 0 } }
    ]),
    BoundaryShifter.generateVariants("PD_S_left", { h2: 97.5, ch4: 2, c2h6: 0.5 }, "PD", [
        { suffix: "PD", expected: "PD", delta: { h2: -0.1, ch4: 0.1, c2h6: 0 } },
        { suffix: "S", expected: "S", delta: { h2: 0.1, ch4: -0.1, c2h6: 0 } }
    ]),
    BoundaryShifter.generateVariants("PD_S_down", { h2: 90, ch4: 9, c2h6: 1 }, "S", [
        { suffix: "S", expected: "S", delta: { h2: 0, ch4: -0.1, c2h6: 0.1 } },
        { suffix: "PD", expected: "PD", delta: { h2: 0, ch4: 0.1, c2h6: -0.1 } }
    ]),

    BoundaryShifter.generateVariants("S_O", { h2: 9, ch4: 51, c2h6: 40 }, "S", [
        { suffix: "S", expected: "S", delta: { h2: 0.1, ch4: -0.1, c2h6: 0 } },
        { suffix: "O", expected: "O", delta: { h2: -0.1, ch4: 0.1, c2h6: 0 } }
    ]),
    BoundaryShifter.generateVariants("C_O", { h2: 5, ch4: 65, c2h6: 30 }, "O", [
        { suffix: "C", expected: "C", delta: { h2: 0, ch4: 0.1, c2h6: -0.1 } },
        { suffix: "O", expected: "O", delta: { h2: 0, ch4: -0.1, c2h6: 0.1 } }
    ]),
    BoundaryShifter.generateVariants("ND_O", { h2: 9, ch4: 26, c2h6: 65 }, "ND", [
        { suffix: "ND", expected: "ND", delta: { h2: 0.1, ch4: 0, c2h6: -0.1 } },
        { suffix: "O", expected: "O", delta: { h2: -0.1, ch4: 0, c2h6: 0.1 } }
    ]),
    BoundaryShifter.generateVariants("ND_S", { h2: 30, ch4: 24, c2h6: 46 }, "ND", [
        { suffix: "ND", expected: "ND", delta: { h2: -0.1, ch4: 0, c2h6: 0.1 } },
        { suffix: "S", expected: "S", delta: { h2: 0.1, ch4: 0, c2h6: -0.1 } }
    ])
];