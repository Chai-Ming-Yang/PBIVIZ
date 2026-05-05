# Technical Architecture & Engineering Documentation

## 1. Rendering Pipeline
The visual operates on a decoupled, mediator-driven rendering pipeline. The main `Visual` class (`src/visual.ts`) orchestrates updates between dedicated UI/Viewport controllers and specialized rendering classes, triggering recalculations during each Power BI update cycle.

### Initialization & DOM Structure
The visual separates the DOM into two distinct, independently managed layers:
1.  **UI Layer (`div`)**: Managed by the `UIController`. This absolute-positioned HTML layer contains interactive elements like the dynamically updating legend, custom tooltip, zoom slider, triangle toggle buttons, and schema validation warnings.
2.  **Canvas Layer (`svg`)**: Managed by the `ViewportController`. This is the primary D3 SVG canvas, utilizing a nested transform hierarchy to manage viewport centering and bounds-constrained panning/zooming:
    * `centerGroup`: Translates the origin to `(width / 2, height / 2)`.
    * `viewportGroup`: Applies pan translations (`translateX`, `translateY`) and scale (`zoomLevel`) derived from the UI state.
    * `geometryGroup`: The root container for all SVG visual elements, wiped and rebuilt dynamically via `.transient-layer` groups during each paint.

### Update Loop Sequence
When `update()` is invoked, the mediator executes the following sequence:
1.  **Data & Configuration Extraction**: Retrieves viewport dimensions, the active `TriangleConfig` (1, 4, or 5), and populates the `VisualFormattingSettingsModel`.
2.  **Schema Validation**: Verifies that the input data provides the specific gases required by the active triangle's `axes` configuration. If prerequisites are unmet, rendering halts, transient layers are cleared, and the `UIController` surfaces a missing data warning.
3.  **Transient Layer Purge**: The `ViewportController` purges and regenerates empty `.transient-layer` groups (Regions, Outline, Axes, Labels, Plots) to ensure clean z-indexing.
4.  **Decoupled Drawing Passes**: 
    * `LegendRenderer`: Injects the HTML-based legend based on the active config and formatting settings.
    * `GeometryRenderer`: Processes the static background geometry, drawing filled fault regions, the bounding polygon, axes with ticks/arrows, and textual region/prerequisite labels.
    * `PlotRenderer`: Processes the historical time-series data, plotting trajectory lines and chronological data points, while attaching an `ITooltipHandler` adapter to bridge D3 mouse events to the HTML `UIController`.

### Interactivity & Viewport Constraints
State is managed centrally via the `UIController` and pushed to the `ViewportController`. Pan and zoom events calculate strict boundary math: the absolute maximum distance the canvas can be dragged is determined relative to the viewport dimensions and current zoom multiplier (`maxPanX`, `maxPanY`). X/Y translations are clamped strictly to these bounds to prevent the user from losing the visual off-screen.

## 2. Mathematical Architecture & Geometry

### Polygon Generation
The coordinate space is calculated via `createRegularPolygon` in `geometry.ts`. It constructs an n-sided regular polygon using standard polar-to-cartesian conversions:
* Starts the first vertex at the 12 o'clock position by applying a `-PI / 2` starting angle offset.
* Calculates subsequent vertices by rotating clockwise: `angle = -Math.PI / 2 + (i * 2 * Math.PI) / sides`.
* Returns an array of `Point` interfaces defining the vertices relative to an origin of `(0, 0)`.

### Geometric Mapping (Barycentric to Cartesian)
Gas records are mapped onto the 2D Cartesian plane using a generalized barycentric coordinate system via `barycentricToCartesian`:
* Iterates through the ordered `axes` array provided by the active `TriangleConfig` to extract the raw values (`weights`).
* Calculates the cartesian point by computing the weighted sum of the polygon's vertices: `x += (weight / total) * point.x` and `y += (weight / total) * point.y`.
* If the sum of all weights is zero, it safely falls back to the origin `(0, 0)`.

### Edge Kinematics
The function `getPolygonEdges` derives the properties of the perimeter for rendering ticks and axes. For each edge:
* Calculates the normalized direction vector `(dx / length, dy / length)`.
* Computes the outward-facing normal vector assuming clockwise winding: `x: -direction.y, y: direction.x`. This normal is subsequently used to project labels and tick marks perpendicularly away from the polygon boundaries.

## 3. Data Normalization & Parsing

### Data Extraction
The `parseData` extraction engine handles the Power BI `DataView` dynamically.
* Dynamically maps the input columns by searching the `roles` dictionary against the `AxisConfig` required by the active triangle, alongside extracting any extra measures passed into the `tooltips` bucket.
* Constructs `ParsedDataPoint` objects associating chronologically sorted dates with n-dimensional `GasRecord` dictionaries and extended tooltip arrays.
* Drops the rendering request by returning an empty array if any configured axis index is unresolved (`index === -1`).

### Normalization
The `normalizeData` utility processes the n-dimensional gas datasets.
* It computes the total sum of all parameters in the individual record.
* If `total === 0`, it initializes all keys to `0`.
* Otherwise, it applies standard percentage normalization: `(input[key] / total) * 100`.

## 4. Fault Region Classification
Unlike coordinate rendering, fault determination does not rely on geometric point-in-polygon mapping. Classification utilizes a Strategy Pattern architecture evaluated through `classifyFaultWithSpecifications`.

* The engine fetches an array of `IFaultSpecification` objects corresponding to the active triangle via the `FaultSpecificationFactory`.
* It iterates sequentially through these specific rule sets. For each specification, it evaluates the `isSatisfiedBy(data)` programmatic function against the *normalized* `GasRecord`.
* The system operates on a deterministic "first match wins" strategy, immediately returning the `FaultType` (e.g., `PD`, `T1`, `DT`) upon a `true` evaluation. If no conditions pass, it returns `Unknown`.
* Visual boundaries defined in `TriangleConfig` draw the colored SVG backgrounds, whereas these specification classes independently evaluate the raw data logic.

## 5. Data Mapping & Formatting

### Capability Definitions
The input schema is defined in `capabilities.json`, specifying the following data roles:
* **Grouping**: `date` (Chronological sorting index).
* **Measures**: `ch4`, `c2h4`, `c2h2`, `h2`, `c2h6` (Gas concentration inputs), and `tooltips` (Supplementary data for hover interactions).

### User Configuration Surface
`settings.ts` utilizes the modern `FormattingSettingsModel` to bridge properties to the user-configurable UI.
* **Legend (`legendTextCard`)**: Contains a global visibility toggle (`show`) and string input definitions mapping configuration keys to custom user-defined text (e.g., overriding `PD_text`).
* **Segments (`segmentsCard`)**: Provides individual `ColorPicker` controls for every distinct fault type (e.g., `PD`, `T1`, `DT`, `S`, `C`), coupled with a global transparency percentage controller.
* **Connector (`connectorCard`)**: Toggles the chronological trajectory lines between historical points, adjusting thickness and hex colors.
* **Data Points (`pointSettingsCard`)**: Differentiates the styling attributes (Size, Color) between historical coordinate plots and the most recent chronological reading (Latest Point).