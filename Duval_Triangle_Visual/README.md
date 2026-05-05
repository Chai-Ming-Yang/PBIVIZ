# Duval Triangle Visual

This visual implements the **Duval Triangle Method** (Triangles 1, 4, and 5) for transformer fault classification. It dynamically maps specific Dissolved Gas Analysis (DGA) vectors onto a 2D Cartesian plane using a generalized barycentric coordinate system and evaluates faults using deterministic specification rules.

## 🚀 Quick Start (For End Users)
If you just want to use the visual in Power BI:
1. Open the **[dist/](./dist)** folder in this directory.
2. Download the `.pbiviz` file.
3. In Power BI Desktop, go to the **Visualizations Pane** > **Import from file**.

---

## 🛠️ Developer Guide (For Customization)
If you want to modify the geometry, testing, or rendering logic:

### 1. Environment Setup
Ensure you have the [Power BI Visuals Tools](https://learn.microsoft.com/en-us/power-bi/developer/visuals/environment-setup) installed.
```bash
npm install -g powerbi-visuals-tools
```

### 2. Clone and Navigate
To work on this specific visual, clone the master repository and navigate to this folder:
```bash
git clone [https://github.com/Chai-Ming-Yang/PBIVIZ.git](https://github.com/Chai-Ming-Yang/PBIVIZ.git)
cd PBIVIZ/Duval_Triangle_Visual
```

### 3. Build & Test Instructions

#### Install dependencies
```bash
npm install
```

#### Start local dev server (Testing in Power BI Service)
```bash
pbiviz start
```

#### Run the validation test suite
Executes Jest boundary scenarios and exports test validation data to CSV.
```bash
npm test
```

#### Compile/Package the visual
Packages the visual into the `/dist` folder for production.
```bash
npm run package
```

### 4. Modern Architecture & File Structure
The visual has been refactored into a decoupled, mediator-driven rendering pipeline:

- **`src/config.ts`**: Centralized configuration defining axes, regions, labels, and global UI settings for Triangles 1, 4, and 5.
- **`src/controllers/`**: 
  - `UIController.ts`: Manages HTML UI states (legend, tooltips, slider, toggles).
  - `ViewportController.ts`: Manages D3 SVG canvas transforms, panning, and zooming.
- **`src/renderers/`**: Dedicated, stateless rendering classes for the DOM (`GeometryRenderer.ts`, `PlotRenderer.ts`, `LegendRenderer.ts`).
- **`src/utils/`**:
  - `classifier.ts` & `faultSpecifications.ts`: Deterministic Strategy Pattern logic for fault classification.
  - `geometry.ts`: Core math for n-sided polygon generation and barycentric coordinate mapping.
  - `dataParser.ts`: Dynamic column-to-axis mapping engine.
- **`src/tests/`**: Comprehensive Jest test suite spanning dynamic boundary scenarios, alongside tools for automated CSV validation data generation.