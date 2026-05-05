import { CoordinateBoundaryShifter, CoordinateTestPoint } from "../tools/TestUtils";

export const P1_COORD_SCENARIOS: CoordinateTestPoint[][] = [
    
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
        { suffix: "S_Top", expected: "S", delta: { x: 0, y: 0.1 } },     
        { suffix: "S_Left", expected: "S", delta: { x: -0.1, y: 0 } }    
    ]),
    CoordinateBoundaryShifter.generateVariants("PD_S_corner_2", { x: -1, y: 24.5 }, "Corner", [
        { suffix: "PD", expected: "PD", delta: { x: 0.1, y: 0.1 } },     
        { suffix: "S_Bottom", expected: "S", delta: { x: 0, y: -0.1 } }, 
        { suffix: "S_Left", expected: "S", delta: { x: -0.1, y: 0 } }    
    ]),
    CoordinateBoundaryShifter.generateVariants("PD_D1", { x: 0, y: 28.75 }, "Edge", [
        { suffix: "PD", expected: "PD", delta: { x: -0.1, y: 0 } }, 
        { suffix: "D1", expected: "D1", delta: { x: 0.1, y: 0 } }   
    ]),
    CoordinateBoundaryShifter.generateVariants("PD_S_D1_1", { x: 0, y: 33 }, "Junction", [
        { suffix: "PD", expected: "PD", delta: { x: -0.1, y: -0.1 } }, 
        { suffix: "S", expected: "S", delta: { x: -0.1, y: 0.1 } },    
        { suffix: "D1", expected: "D1", delta: { x: 0.1, y: 0 } }      
    ]),
    CoordinateBoundaryShifter.generateVariants("PD_S_D1_2", { x: 0, y: 24.5 }, "Junction", [
        { suffix: "PD", expected: "PD", delta: { x: -0.1, y: 0.1 } },  
        { suffix: "S", expected: "S", delta: { x: -0.1, y: -0.1 } },   
        { suffix: "D1", expected: "D1", delta: { x: 0.1, y: 0 } }      
    ]),


    CoordinateBoundaryShifter.generateVariants("S_D1_1", { x: 0, y: 36.5 }, "Edge", [
        { suffix: "S", expected: "S", delta: { x: -0.1, y: 0 } },
        { suffix: "D1", expected: "D1", delta: { x: 0.1, y: 0 } }
    ]),
    CoordinateBoundaryShifter.generateVariants("S_D1_2", { x: 0, y: 13 }, "Edge", [
        { suffix: "S", expected: "S", delta: { x: -0.1, y: 0 } },
        { suffix: "D1", expected: "D1", delta: { x: 0.1, y: 0 } },
    ]),
    CoordinateBoundaryShifter.generateVariants("T1_D2", { x: 0, y: -0.75 }, "Edge", [
        { suffix: "T1", expected: "T1", delta: { x: -0.1, y: 0 } },
        { suffix: "D2", expected: "D2", delta: { x: 0.1, y: 0 } }
    ]),

    
    CoordinateBoundaryShifter.generateVariants("S_T1_D1_D2", { x: 0, y: 1.5 }, "Junction", [
        { suffix: "S", expected: "S", delta: { x: -0.1, y: 0.1 } },
        { suffix: "T1", expected: "T1", delta: { x: -0.1, y: -0.1 } },
        { suffix: "D1", expected: "D1", delta: { x: 0.1, y: 0.5 } },
        { suffix: "D2", expected: "D2", delta: { x: 0.1, y: -0.1 } }
    ]),

    CoordinateBoundaryShifter.generateVariants("S_T1", { x: -17.5, y: 2.25 }, "Edge", [
        { suffix: "S", expected: "S", delta: { x: 0, y: 0.1 } },
        { suffix: "T1", expected: "T1", delta: { x: 0, y: -0.1 } }
    ]),
    CoordinateBoundaryShifter.generateVariants("T1_T2", { x: -14.25, y: -18.2 }, "Edge", [
        { suffix: "T1", expected: "T1", delta: { x: -0.1, y: 0.1 } },
        { suffix: "T2", expected: "T2", delta: { x: 0.1, y: -0.1 } }
    ]),
    CoordinateBoundaryShifter.generateVariants("T2_T3", { x: -2.5, y: -18.2 }, "Edge", [
        { suffix: "T2", expected: "T2", delta: { x: -0.1, y: 0 } },
        { suffix: "T3", expected: "T3", delta: { x: 0.1, y: 0 } }
    ]),
    CoordinateBoundaryShifter.generateVariants("T1_T3", { x: -3, y: -3.5 }, "Edge", [
        { suffix: "T1", expected: "T1", delta: { x: -0.1, y: 0.1 } },
        { suffix: "T3", expected: "T3", delta: { x: 0.1, y: -0.1 } }
    ]),
    CoordinateBoundaryShifter.generateVariants("T3_D2", { x: 12.15, y: -16.5 }, "Edge", [
        { suffix: "T3", expected: "T3", delta: { x: -0.1, y: -0.1 } },
        { suffix: "D2", expected: "D2", delta: { x: 0.1, y: 0.1 } }
    ]),


    CoordinateBoundaryShifter.generateVariants("D1_D2_1", { x: 2, y: 8.75 }, "Edge", [
        { suffix: "D1", expected: "D1", delta: { x: -0.1, y: 0.1 } },
        { suffix: "D2", expected: "D2", delta: { x: 0.1, y: -0.1 } }
    ]),
    CoordinateBoundaryShifter.generateVariants("D1_D2_2", { x: 18, y: 4.95 }, "Edge", [
        { suffix: "D1", expected: "D1", delta: { x: 0.1, y: 0.1 } },
        { suffix: "D2", expected: "D2", delta: { x: -0.1, y: -0.1 } }
    ]),


    CoordinateBoundaryShifter.generateVariants("T1_T3_D2", { x: 0, y: -3 }, "Junction", [
        { suffix: "T1", expected: "T1", delta: { x: -0.1, y: 0.1 } },
        { suffix: "T3", expected: "T3", delta: { x: -0.1, y: -0.1 } },
        { suffix: "D2", expected: "D2", delta: { x: 0.1, y: 0 } }
    ]),
    CoordinateBoundaryShifter.generateVariants("T1_T2_T3", { x: -6, y: -4 }, "Junction", [
        { suffix: "T1", expected: "T1", delta: { x: 0, y: 0.1 } },
        { suffix: "T2", expected: "T2", delta: { x: 0, y: -0.1 } },
        { suffix: "T3", expected: "T3", delta: { x: 0.1, y: -0.1 } }
    ]),
    CoordinateBoundaryShifter.generateVariants("D1_D2_corner", { x: 4, y: 16 }, "Junction", [
        { suffix: "D1", expected: "D1", delta: { x: 0, y: 0.1 } },
        { suffix: "D2", expected: "D2", delta: { x: 0, y: -0.1 } }
    ])
];