import { generateTriangleCSV } from "./CSVGenerator";
import { T1_BOUNDARY_SCENARIOS } from "../scenarios/Triangle1Scenarios";
import { T4_BOUNDARY_SCENARIOS } from "../scenarios/Triangle4Scenarios";
import { T5_BOUNDARY_SCENARIOS } from "../scenarios/Triangle5Scenarios";

// The script is now just a thin wrapper around the registry
generateTriangleCSV("1", T1_BOUNDARY_SCENARIOS);
console.log("📊 Triangle 1 validation data refreshed.");

generateTriangleCSV("4", T4_BOUNDARY_SCENARIOS);
console.log("📊 Triangle 4 validation data refreshed.");

generateTriangleCSV("5", T5_BOUNDARY_SCENARIOS);
console.log("📊 Triangle 5 validation data refreshed.");