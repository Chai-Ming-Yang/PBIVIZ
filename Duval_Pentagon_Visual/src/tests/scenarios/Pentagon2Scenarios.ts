import { CoordinateBoundaryShifter, CoordinateTestPoint } from "../tools/TestUtils";

export const P2_COORD_SCENARIOS: CoordinateTestPoint[][] = [
    
    // --- PD & S Boundaries ---
    CoordinateBoundaryShifter.generateVariants("PD_S_1", { x: -0.5, y: 33 }, "Edge", [
        { suffix: "PD", expected: "PD", delta: { x: 0, y: -0.1 } }, 
        { suffix: "S", expected: "S", delta: { x: 0, y: 0.1 } }     
    ]),
    CoordinateBoundaryShifter.generateVariants("PD_S_2", { x: -1, y: 28.75 }, "Edge", [
        { suffix: "PD", expected: "PD", delta: { x: 0.1, y: 0 } },  
        { suffix: "S", expected: "S", delta: { x: -0.1, y: 0 } }    
    ]),
    CoordinateBoundaryShifter.generateVariants("PD_S_3", { x: -0.5, y: 24.5 }, "Edge", [
        { suffix: "PD", expected: "PD", delta: { x: 0, y: 0.1 } },  
        { suffix: "S", expected: "S", delta: { x: 0, y: -0.1 } }    
    ]),
    CoordinateBoundaryShifter.generateVariants("PD_S_corner_1", { x: -1, y: 33 }, "Corner", [
        { suffix: "PD", expected: "PD", delta: { x: 0.1, y: -0.1 } },    
        { suffix: "S", expected: "S", delta: { x: 0, y: 0.1 } },     
    ]),
    CoordinateBoundaryShifter.generateVariants("PD_S_corner_2", { x: -1, y: 24.5 }, "Corner", [
        { suffix: "PD", expected: "PD", delta: { x: 0.1, y: 0.1 } },     
        { suffix: "S", expected: "S", delta: { x: 0, y: -0.1 } }, 
    ]),

    // --- S & D1 Boundary ---
    CoordinateBoundaryShifter.generateVariants("S_D1_1", { x: 0, y: 36.5 }, "Edge", [
        { suffix: "S", expected: "S", delta: { x: -0.1, y: 0 } },
        { suffix: "D1", expected: "D1", delta: { x: 0.1, y: 0 } }
    ]),
    CoordinateBoundaryShifter.generateVariants("S_D1_2", { x: 0, y: 13 }, "Edge", [
        { suffix: "S", expected: "S", delta: { x: -0.1, y: 0 } },
        { suffix: "D1", expected: "D1", delta: { x: 0.1, y: 0 } },
    ]),

    // --- D1 & D2 Boundary ---
    CoordinateBoundaryShifter.generateVariants("D1_D2_1", { x: 18, y: 4.95 }, "Edge", [
        { suffix: "D1", expected: "D1", delta: { x: -0.1, y: 0.1 } }, 
        { suffix: "D2", expected: "D2", delta: { x: 0.1, y: -0.1 } } 
    ]),

    // --- D2 & T3-H Boundary ---
    CoordinateBoundaryShifter.generateVariants("D2_T3H_1", { x: 12.15, y: -16.5 }, "Edge", [
        { suffix: "D2", expected: "D2", delta: { x: 0.1, y: 0.1 } }, 
        { suffix: "T3-H", expected: "T3-H", delta: { x: -0.1, y: -0.1 } }
    ]),

    // --- T3-H & C Boundary (STEEP) ---
    CoordinateBoundaryShifter.generateVariants("T3H_C_1", { x: -0.5, y: -17.7 }, "Edge", [
        { suffix: "T3-H", expected: "T3-H", delta: { x: 0.1, y: 0 } }, 
        { suffix: "C", expected: "C", delta: { x: -0.1, y: 0 } } 
    ]),

    // --- C & O Boundaries ---
    CoordinateBoundaryShifter.generateVariants("C_O_1", { x: -7.25, y: -5.5 }, "Edge", [
        { suffix: "C", expected: "C", delta: { x: 0.1, y: -0.1 } }, 
        { suffix: "O", expected: "O", delta: { x: -0.1, y: 0.1 } } 
    ]),
    CoordinateBoundaryShifter.generateVariants("C_O_2", { x: -16.25, y: -20.2 }, "Edge", [
        { suffix: "C", expected: "C", delta: { x: 0.1, y: 0 } }, 
        { suffix: "O", expected: "O", delta: { x: -0.1, y: 0 } } 
    ]),

    // --- O & S Boundary ---
    CoordinateBoundaryShifter.generateVariants("O_S_1", { x: -17.5, y: 2.3 }, "Edge", [
        { suffix: "S", expected: "S", delta: { x: 0, y: 0.1 } }, 
        { suffix: "O", expected: "O", delta: { x: 0, y: -0.1 } } 
    ]),

    // Central Top Junction (0, 1.5)
    CoordinateBoundaryShifter.generateVariants("S_O_D1_D2", { x: 0, y: 1.5 }, "Junction", [
        { suffix: "S", expected: "S", delta: { x: -0.1, y: 0.1 } },
        { suffix: "O", expected: "O", delta: { x: -0.1, y: -0.1 } },
        { suffix: "D1", expected: "D1", delta: { x: 0.02, y: 0.1 } }, // Ratio skewed to clear m=3.625 slope
        { suffix: "D2", expected: "D2", delta: { x: 0.1, y: -0.1 } }
    ]),

    // Central Bottom Junction (0, -3)
    CoordinateBoundaryShifter.generateVariants("O_D2_T3H", { x: 0, y: -3 }, "Junction", [
        { suffix: "O", expected: "O", delta: { x: -0.1, y: 0.1 } },
        { suffix: "D2", expected: "D2", delta: { x: 0, y: 0.1 } },
        { suffix: "T3-H", expected: "T3-H", delta: { x: 0, y: -0.1 } }
    ]),

    // Left-Center Junction (-3.5, -3)
    CoordinateBoundaryShifter.generateVariants("O_T3H_C", { x: -3.5, y: -3 }, "Junction", [
        { suffix: "O", expected: "O", delta: { x: -0.1, y: 0.1 } },
        { suffix: "T3-H", expected: "T3-H", delta: { x: 0.1, y: -0.1 } },
        { suffix: "C", expected: "C", delta: { x: 0, y: -0.1 } } 
    ]),

    // Corner at (-11, -8) between O and C
    CoordinateBoundaryShifter.generateVariants("O_C_corner", { x: -11, y: -8 }, "Corner", [
        { suffix: "O", expected: "O", delta: { x: -0.1, y: 0 } }, 
        { suffix: "C", expected: "C", delta: { x: 0.1, y: 0 } }  
    ]),

    // Corner at (4, 16) between D1 and D2
    CoordinateBoundaryShifter.generateVariants("D1_D2_corner", { x: 4, y: 16 }, "Corner", [
        { suffix: "D1", expected: "D1", delta: { x: -0.1, y: 0.1 } }, 
        { suffix: "D2", expected: "D2", delta: { x: 0.1, y: -0.1 } }  
    ])
];