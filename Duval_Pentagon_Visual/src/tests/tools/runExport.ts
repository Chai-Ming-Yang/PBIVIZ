import { PentagonCSVGenerator, SyntheticDataGenerator } from "./PentagonCSVGenerator";
import { PENTAGON_CONFIGS, DUVAL_AXIS_VERTICES } from "../../config";

// The defined fault zones for both Pentagons
const p1TargetRegions = ["PD", "D1", "D2", "T1", "T2", "T3", "S"];
const p2TargetRegions = ["PD", "D1", "D2", "S", "O", "C", "T3-H"];

console.log("Generating unified synthetic Monte Carlo dataset for DP1 and DP2...");

// Step 1: Generate the unified 5-gas data
const syntheticData = SyntheticDataGenerator.generateUnifiedMonteCarloDataset(
    p1TargetRegions,
    p2TargetRegions,
    10, // 10 points per region
    DUVAL_AXIS_VERTICES, 
    PENTAGON_CONFIGS["P1"].axes // P1 and P2 axes are mathematically identical
);

// Step 2: Export the generated data to CSV
PentagonCSVGenerator.exportGasRecords(syntheticData);