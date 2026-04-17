# Duval Pentagon Visual

This visual implements the **Duval Pentagon Method** for transformer fault classification. It maps five DGA gas vectors to determine the fault type based on the center of mass within an irregular polygon.

## 🚀 Quick Start (For End Users)
If you just want to use the visual in Power BI:
1. Open the **[dist/](./dist)** folder in this directory.
2. Download the `.pbiviz` file.
3. In Power BI Desktop, go to the **Visualizations Pane** > **Import from file**.

---

## 🛠️ Developer Guide (For Customization)
If you want to modify the geometry or logic:

### 1. Environment Setup
Ensure you have the [Power BI Visuals Tools](https://learn.microsoft.com/en-us/power-bi/developer/visuals/environment-setup) installed.
```bash
npm install -g powerbi-visuals-tools
```

### 2. Clone and Navigate
To work on this specific visual, clone the master repository and navigate to this folder:
```bash
git clone [https://github.com/Chai-Ming-Yang/PBIVIZ.git](https://github.com/Chai-Ming-Yang/PBIVIZ.git)
cd PBIVIZ/Duval_Pentagon_Visual
```

### 3. Build Instructions

#### Install dependencies
```bash
npm install
```

#### Start local dev server (Testing in Power BI Service)
```bash
pbiviz start
```

#### Compile/Package the visual
```bash
pbiviz package
```

### 4. File Structure
- `src/utils/geometry.ts`: Polygon coordinate mapping.
- `src/utils/classifier.ts`: Fault region detection logic.
- `capabilities.json`: Data field definitions.