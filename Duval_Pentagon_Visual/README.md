# Duval Pentagon Visual

This visual implements the **Duval Pentagon Method** for transformer fault classification. It accurately maps five Dissolved Gas Analysis (DGA) gas vectors to determine the exact fault type based on the mathematical center of mass within an irregular polygon. 

This modern implementation supports both **Pentagon 1 (P1)** for standard fault diagnosis and **Pentagon 2 (P2)** for detailed thermal fault sub-classification, utilizing a strict Model-View-Controller (MVC) architecture and robust Ray-Casting boundary validation.

---

## 🚀 Quick Start (For End Users)

If you just want to use the visual in Power BI:
1. Open the **`dist/`** folder in this directory.
2. Download the `.pbiviz` file.
3. In Power BI Desktop, go to the **Visualizations Pane** > **Import from file**.

### How to Map Your Data
[cite_start]To render the pentagon, you must map your dataset to the visual's required data roles[cite: 1]:
* [cite_start]**Date (Grouping):** The chronological timestamp for each diagnostic sample[cite: 1].
* [cite_start]**Gas Measures:** Map the raw PPM (Parts Per Million) values for the 5 key gases: Methane (CH4), Ethylene (C2H4), Acetylene (C2H2), Hydrogen (H2), and Ethane (C2H6)[cite: 1].
* [cite_start]**Tooltips (Optional):** Drag any additional context fields here to display them when hovering over data points[cite: 1].

### Formatting Options
[cite_start]The visual exposes several declarative property groups in the Power BI formatting pane[cite: 1]:
* [cite_start]**Legend:** Toggle visibility and customize localized text overrides for all standard IEC fault region labels (e.g., PD, D1, D2, T1, T2, T3, S, O, C)[cite: 1].
* [cite_start]**Segments:** Customize the Hex fill colors and global transparency for the underlying D3 polygon regions[cite: 1].
* [cite_start]**Connector:** Toggle the chronological path connector between points, and adjust its line color and thickness[cite: 1].
* [cite_start]**Data Points:** Visually separate the most recent diagnostic plot from historical traces by assigning distinct sizes and colors to the "Latest" vs. "Other" points[cite: 1].

---

## 🧠 Core Features & Architecture

* **Dual Pentagons:** Dynamically toggle between Pentagon 1 and Pentagon 2 via the UI overlay.
* **Strict Mathematical Projection (`MathFacade`):** Calculates exact spatial coordinates using a strict pipeline: Normalization -> Radial Projection -> Shoelace Centroid.
* **Specification Pattern Classification:** Replaces legacy conditional logic with an Object-Oriented Specification Pattern, utilizing a Ray-Casting algorithm to evaluate data points against exact geometric boundaries.
* **D3 Renderers:** Complete separation of DOM manipulation (UI and Viewport controllers) from pure visual rendering (`GeometryRenderer`, `PlotRenderer`, `LegendRenderer`).

---

## 🛠️ Developer Guide (For Customization)

If you want to modify the geometry, algorithms, or visual logic:

### 1. Environment Setup
Ensure you have the [Power BI Visuals Tools](https://learn.microsoft.com/en-us/power-bi/developer/visuals/environment-setup) installed.
```bash
npm install -g powerbi-visuals-tools
```

### 2. Clone and Navigate
Clone the repository and navigate to this folder:
```bash
git clone [https://github.com/Chai-Ming-Yang/PBIVIZ.git](https://github.com/Chai-Ming-Yang/PBIVIZ.git)
cd PBIVIZ/Duval_Pentagon_Visual
```

### 3. Build Instructions & Scripts
[cite_start]This project includes automated testing and data generation scripts[cite: 2].

* **Install dependencies:**
    ```bash
    npm install
    ```
* **Start local dev server** (Testing live in Power BI Service):
    ```bash
    pbiviz start
    ```
* [cite_start]**Generate Synthetic Data:** Runs a Monte Carlo generator to create mathematically sound CSV datasets for testing UI edge cases across both pentagons[cite: 2].
    ```bash
    npm run export-data
    ```
* **Run the Test Suite:** Automatically generates synthetic data and executes the Jest testing suite, including rigorous E2E literature validation against Michel Duval's published coordinates[cite: 2].
    ```bash
    npm run test
    ```
* **Compile/Package the visual:** Runs the test suite to guarantee algorithmic safety, then builds the production `.pbiviz` file[cite: 2].
    ```bash
    npm run package
    ```

### 4. File Structure
* `src/visual.ts`: The main orchestrator utilizing Dependency Injection.
* `src/config.ts`: Centralized definition of vertices, axes, and UI defaults.
* `src/utils/geometry.ts`: The pure-math `MathFacade` handling the Shoelace Centroid and vector projections.
* `src/utils/faultSpecifications.ts`: The Object-Oriented Ray-Casting boundaries for exact domain classification.
* `src/controllers/`: HTML UI overlay (`UIController`) and SVG Pan/Zoom state management (`ViewportController`).
* `src/renderers/`: Pure D3 mapping logic (`GeometryRenderer`, `PlotRenderer`, `LegendRenderer`).
* `src/tests/`: Jest test suite including `CoordinateBoundaryShifter` for boundary evaluation and E2E literature checks.