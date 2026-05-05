import { BoundaryShifter } from "../tools/TestUtils";

export const T1_BOUNDARY_SCENARIOS = [
    BoundaryShifter.generateVariants("T1_T2_DT", { ch4: 76, c2h4: 20, c2h2: 4 }, "DT", [
        { suffix: "T1", expected: "T1", delta: { ch4: 0.2, c2h4: -0.1, c2h2: -0.1 } },
        { suffix: "T2", expected: "T2", delta: { ch4: 0.1, c2h4: 0, c2h2: -0.1 } }, 
        { suffix: "DT", expected: "DT", delta: { ch4: -0.1, c2h4: 0, c2h2: 0.1 } }
    ]),
    BoundaryShifter.generateVariants("T2_T3_DT", { ch4: 46, c2h4: 50, c2h2: 4 }, "T3", [
        { suffix: "T2", expected: "T2", delta: { ch4: 0.2, c2h4: -0.1, c2h2: -0.1 } },
        { suffix: "T3", expected: "T3", delta: { ch4: -0.1, c2h4: 0.1, c2h2: 0 } },
        { suffix: "DT", expected: "DT", delta: { ch4: 0.1, c2h4: -0.1, c2h2: 0 } }
    ]),
    BoundaryShifter.generateVariants("DT_D1_D2", { ch4: 64, c2h4: 23, c2h2: 13 }, "D2", [
        { suffix: "D1", expected: "D1", delta: { ch4: 0.1, c2h4: -0.1, c2h2: 0 } },
        { suffix: "D2", expected: "D2", delta: { ch4: -0.1, c2h4: 0, c2h2: 0.1 } },
        { suffix: "DT", expected: "DT", delta: { ch4: 0.1, c2h4: 0, c2h2: -0.1 } }
    ]),

    BoundaryShifter.generateVariants("T1_T2", { ch4: 78, c2h4: 20, c2h2: 2 }, "T2", [
        { suffix: "T2", expected: "T2", delta: { ch4: -0.1, c2h4: 0.1, c2h2: 0 } },
        { suffix: "T1", expected: "T1", delta: { ch4: 0.1, c2h4: -0.1, c2h2: 0 } }
    ]),
    BoundaryShifter.generateVariants("T2_T3", { ch4: 48, c2h4: 50, c2h2: 2 }, "T3", [
        { suffix: "T3", expected: "T3", delta: { ch4: -0.1, c2h4: 0.1, c2h2: 0 } },
        { suffix: "T2", expected: "T2", delta: { ch4: 0.1, c2h4: -0.1, c2h2: 0 } }
    ]),
    BoundaryShifter.generateVariants("T1_DT", { ch4: 86, c2h4: 10, c2h2: 4 }, "DT", [
        { suffix: "DT", expected: "DT", delta: { ch4: -0.1, c2h4: 0, c2h2: 0.1 } },
        { suffix: "T1", expected: "T1", delta: { ch4: 0.1, c2h4: 0, c2h2: -0.1 } }
    ]),
    
    BoundaryShifter.generateVariants("D1_D2_1", { ch4: 57, c2h4: 23, c2h2: 20 }, "D2", [
        { suffix: "D2", expected: "D2", delta: { ch4: -0.1, c2h4: 0.1, c2h2: 0 } },
        { suffix: "D1", expected: "D1", delta: { ch4: 0.1, c2h4: -0.1, c2h2: 0 } }
    ]),
    BoundaryShifter.generateVariants("D1_D2_2", { ch4: 40, c2h4: 23, c2h2: 37 }, "D2", [
        { suffix: "D2", expected: "D2", delta: { ch4: -0.1, c2h4: 0.1, c2h2: 0 } },
        { suffix: "D1", expected: "D1", delta: { ch4: 0.1, c2h4: -0.1, c2h2: 0 } }
    ]),
    BoundaryShifter.generateVariants("D1_D2_3", { ch4: 20, c2h4: 23, c2h2: 57 }, "D2", [
        { suffix: "D2", expected: "D2", delta: { ch4: -0.1, c2h4: 0.1, c2h2: 0 } },
        { suffix: "D1", expected: "D1", delta: { ch4: 0.1, c2h4: -0.1, c2h2: 0 } }
    ]),

    BoundaryShifter.generateVariants("PD_T1", { ch4: 98, c2h4: 1, c2h2: 1 }, "PD", [
        { suffix: "PD", expected: "PD", delta: { ch4: 0.1, c2h4: -0.1, c2h2: 0 } },
        { suffix: "T1", expected: "T1", delta: { ch4: -0.1, c2h4: 0.1, c2h2: 0 } }
    ]),
    BoundaryShifter.generateVariants("D1_DT", { ch4: 75.5, c2h4: 11.5, c2h2: 13 }, "D1", [
        { suffix: "D1", expected: "D1", delta: { ch4: -0.1, c2h4: 0, c2h2: 0.1 } },
        { suffix: "DT", expected: "DT", delta: { ch4: 0.1, c2h4: 0, c2h2: -0.1 } }
    ]),
    BoundaryShifter.generateVariants("T2_DT", { ch4: 61, c2h4: 35, c2h2: 4 }, "DT", [
        { suffix: "DT", expected: "DT", delta: { ch4: -0.1, c2h4: 0, c2h2: 0.1 } },
        { suffix: "T2", expected: "T2", delta: { ch4: 0.1, c2h4: 0, c2h2: -0.1 } }
    ]),

    BoundaryShifter.generateVariants("D2_DT_1", { ch4: 55.5, c2h4: 31.5, c2h2: 13 }, "D2", [
        { suffix: "D2", expected: "D2", delta: { ch4: -0.1, c2h4: 0, c2h2: 0.1 } },
        { suffix: "DT", expected: "DT", delta: { ch4: 0.1, c2h4: 0, c2h2: -0.1 } }
    ]),
    BoundaryShifter.generateVariants("D2_DT_2", { ch4: 39, c2h4: 40, c2h2: 21 }, "DT", [
        { suffix: "DT", expected: "DT", delta: { ch4: -0.1, c2h4: 0.1, c2h2: 0 } },
        { suffix: "D2", expected: "D2", delta: { ch4: 0.1, c2h4: -0.1, c2h2: 0 } }
    ]),
    BoundaryShifter.generateVariants("D2_DT_3", { ch4: 15.5, c2h4: 55.5, c2h2: 29 }, "D2", [
        { suffix: "D2", expected: "D2", delta: { ch4: -0.1, c2h4: 0, c2h2: 0.1 } },
        { suffix: "DT", expected: "DT", delta: { ch4: 0.1, c2h4: 0, c2h2: -0.1 } }
    ]),
    
    BoundaryShifter.generateVariants("D2_DT_corner_1", { ch4: 47, c2h4: 40, c2h2: 13 }, "DT", [
        { suffix: "D2", expected: "D2", delta: { ch4: 0, c2h4: -0.1, c2h2: 0.1 } },
        { suffix: "DT", expected: "DT", delta: { ch4: 0, c2h4: 0.1, c2h2: -0.1 } }
    ]),
    BoundaryShifter.generateVariants("D2_DT_corner_2", { ch4: 31, c2h4: 40, c2h2: 29 }, "D2", [
        { suffix: "D2", expected: "D2", delta: { ch4: 0, c2h4: -0.1, c2h2: 0.1 } },
        { suffix: "DT", expected: "DT", delta: { ch4: 0, c2h4: 0.1, c2h2: -0.1 } }
    ]),


    BoundaryShifter.generateVariants("DT_T3_1", { ch4: 40.5, c2h4: 50, c2h2: 9.5 }, "T3", [
        { suffix: "T3", expected: "T3", delta: { ch4: -0.1, c2h4: 0.1, c2h2: 0 } },
        { suffix: "DT", expected: "DT", delta: { ch4: 0.1, c2h4: -0.1, c2h2: 0 } }
    ]),
    BoundaryShifter.generateVariants("DT_T3_2", { ch4: 25, c2h4: 60, c2h2: 15 }, "DT", [
        { suffix: "DT", expected: "DT", delta: { ch4: -0.1, c2h4: 0, c2h2: 0.1 } },
        { suffix: "T3", expected: "T3", delta: { ch4: 0.1, c2h4: 0, c2h2: -0.1 } }
    ]),

    BoundaryShifter.generateVariants("DT_T3_corner_1", { ch4: 35, c2h4: 50, c2h2: 15 }, "DT", [
        { suffix: "DT", expected: "DT", delta: { ch4: -0.1, c2h4: 0, c2h2: 0.1 } },
        { suffix: "T3", expected: "T3", delta: { ch4: 0.1, c2h4: 0, c2h2: -0.1 } }
    ])
];