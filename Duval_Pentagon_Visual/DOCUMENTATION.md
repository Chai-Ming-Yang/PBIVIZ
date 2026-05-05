# Power BI Custom Visual: Duval Pentagon Documentation

## 1. Architectural Pipeline & Rendering (`visual.ts`, `controllers/`, `renderers/`)
The visual has evolved from a flat rendering script into a strictly decoupled, Model-View-Controller (MVC) inspired architecture. The core `Visual` class acts purely as an orchestrator, utilizing Dependency Injection to manage specialized controllers and renderers.

**Controllers**
* **`UIController`**: Manages the HTML DOM layer. Responsible for absolute-positioned UI overlays, including the dynamic `P1`/`P2` toggle buttons, zoom slider, interactive tooltips, and non-blocking warning banners.
* **`ViewportController`**: Owns the D3-bound SVG canvas. It calculates pan and zoom constraints and applies the critical `scale(1, -1)` transform. This inverts the standard top-to-bottom SVG Y-axis into a strict bottom-to-top Cartesian coordinate system required for mathematical plotting. It dynamically provisions transient SVG groups (`<g>`) to enforce strict z-indexing (Regions $\rightarrow$ Outlines $\rightarrow$ Axes $\rightarrow$ Plots $\rightarrow$ Labels).

**Renderers**
Pure rendering functions are isolated within `renderers/`. They contain no business logic and exist solely to map domain objects to D3 DOM elements:
* `GeometryRenderer`: Draws the structural polygons, colored fault regions, axes, and dynamic labels.
* `PlotRenderer`: Handles the chronological tracing of data points, path connectors, and interaction bindings (mouseover/mouseout events).
* `LegendRenderer`: Synchronizes the HTML-based legend with the active fault specifications.

## 2. Mathematical Architecture (`MathFacade` & `geometry.ts`)
The legacy Center of Mass algorithm has been replaced by a rigorous, pure-math projection pipeline managed by the `MathFacade`. The visual translates 5-dimensional gas concentrations into 2D Cartesian space via a strict three-step sequence:

1. **Normalization**: Raw gas PPMs are converted into relative percentages (summing to 100).
2. **Radial Projection**: Gas percentages are treated as scalar weights and projected onto the normalized directional vectors of the pentagon's vertices.
3. **Shoelace Centroid**: The algorithm bounds the projected radial points to form an internal geometric shape and calculates its exact area centroid using the Shoelace formula. 
For a given set of projected vertices $(x_i, y_i)$ defining a closed polygon of area $A$, the centroid $(C_x, C_y)$ is calculated as:
$$C_x = \frac{1}{6A} \sum_{i=0}^{n-1} (x_i + x_{i+1})(x_i y_{i+1} - x_{i+1} y_i)$$
$$C_y = \frac{1}{6A} \sum_{i=0}^{n-1} (y_i + y_{i+1})(x_i y_{i+1} - x_{i+1} y_i)$$

If a degenerate polygon is formed (Area = 0), the system safely falls back to a mathematical average of the points to prevent divide-by-zero failures.

## 3. Data Normalization & Parsing (`utils/dataParser.ts`)
Data extraction bridges the raw Power BI `DataView` API to the mathematical domain.
* **Extraction (`parseData`)**: Dynamically maps the `AxisConfig` keys to matching DataView column indices. It aggregates chronological groupings and natively supports generic extra tooltips without polluting the primary gas record.
* **Normalization (`normalizer.ts`)**: Pure function that standardizes raw inputs. $w_{norm} = \left( \frac{w_i}{\sum w} \right) \times 100$.

## 4. Fault Region Classification (Specification Pattern)
The legacy condition-bound classification engine has been entirely refactored into an Object-Oriented **Specification Pattern** (`utils/faultSpecifications.ts`).

**The Engine**
* **`IFaultSpecification`**: An interface defining `isSatisfiedBy(Point)`. Every fault zone (e.g., `PD`, `D1`, `T3-H`) is an isolated class extending `BaseFaultSpecification`.
* **`FaultSpecificationFactory`**: Dynamically serves the correct array of bounding specifications based on the active UI state (`P1` vs `P2`).
* **`classifyFault`**: A pure domain function that evaluates a calculated Cartesian coordinate against the provided specifications to yield a standardized `FaultType`.

**Point-in-Polygon Ray-Casting**
Under the hood, `isSatisfiedBy` utilizes a robust Ray-Casting algorithm. It projects a horizontal ray from the computed Cartesian coordinate along the positive X-axis. If the ray intersects the bounding edges of a specification an odd number of times, the point is strictly categorized as inside that polygon.

## 5. Data Mapping & Formatting Model (`settings.ts`)
Integration with the Power BI host environment relies on declarative property groups exposed via the `powerbi-visuals-utils-formattingmodel`:
* **`LegendTextCard`**: Allows granular, localized text overrides for static IEC fault region abbreviations.
* **`SegmentsCard`**: Maps customized Hex colors and global transparency to the underlying D3 polygon fill styles for both Pentagon 1 and Pentagon 2 regions.
* **`ConnectorCard` & `PointSettingsCard`**: Controls spatial visual decluttering, allowing differentiation of the latest diagnostic plot (Triangle) from historical traces (Circle), alongside configurable path properties.

## 6. Testing & Validation Suite (`tests/`)
To guarantee mathematical precision and algorithmic safety, the repository includes a robust internal testing engine utilizing Jest.
* **Literature E2E Validation**: The full visualization pipeline (Normalization $\rightarrow$ Projection $\rightarrow$ Centroid $\rightarrow$ Classification) is programmatically verified against Michel Duval's exact worked examples published in the *IEEE Electrical Insulation Magazine*.
* **Ray-Casting Boundary Verification**: The `CoordinateBoundaryShifter` rigorously stress-tests the Ray-Casting algorithm by evaluating thousands of points positioned precisely on corners, edges, and complex junctions using micro-deltas ($\pm0.1$).
* **Synthetic Data Generation**: The suite includes a Monte Carlo generator (`SyntheticDataGenerator`) capable of generating vast, mathematically sound PBIVIZ testing datasets to ensure all distinct geometric regions are populated evenly for UI testing.