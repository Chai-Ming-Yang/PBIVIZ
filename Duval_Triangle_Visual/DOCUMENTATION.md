# Technical Architecture & Engineering Documentation

## 1. Rendering Pipeline (`visual.ts`)
The visual operates on a structured rendering pipeline driven by D3.js, recalculating and redrawing layers upon every Power BI update cycle.

### Initialization & DOM Structure
The visual separates the DOM into two distinct layers:
1.  **UI Layer (`div`)**: An absolute-positioned, non-blocking HTML layer containing the legend, tooltip, zoom slider, triangle toggle buttons, and error warnings.
2.  **Canvas Layer (`svg`)**: The primary D3 SVG canvas, which utilizes a nested transform hierarchy to manage viewport centering and user-driven pan/zoom:
    * `centerGroup`: Translates the origin to `(width / 2, height / 2)`.
    * `viewportGroup`: Applies pan translations (`translateX`, `translateY`) and scale (`zoomLevel`).
    * `geometryGroup`: The root for all visual data components, cleared and rebuilt dynamically via `.transient-layer` classes during each update.

### Update Loop Sequence
When `update()` is invoked, the pipeline executes the following sequence:
1.  **Data & Configuration Extraction**: Retrieves dimensions, active triangle configuration (from `TRIANGLE_CONFIGS`), and the current `VisualFormattingSettingsModel`.
2.  **Schema Validation**: Checks if the required columns mapped in the Power BI dataset satisfy the `axes` array of the active triangle configuration. If missing, rendering aborts and an error prompt is displayed.
3.  **Transient Layer Purge**: Selects and removes all elements with the `.transient-layer` class to prepare for a fresh paint.
4.  **Drawing Passes**: Renders components in z-index order from back to front:
    * **Regions**: Fills polygon boundaries based on vertex configurations.
    * **Outline**: Draws the base polygon structure.
    * **Axes**: Renders edges, directional arrows, tick marks, and axis labels.
    * **Labels**: Calculates offsets and paints region identifiers with collision-preventing background rectangles.
    * **Plots**: Extracts historical trajectories and plots sequential data points, drawing line connectors if the distance exceeds `GLOBAL_CONFIG.declutterThreshold`.

### Interactivity & Viewport Constraints
Pan and zoom events utilize strict bounds logic. The absolute maximum distance the canvas can be dragged is calculated relative to the viewport size and current zoom multiplier (`maxPanX` and `maxPanY`). X/Y translations are clamped to these coordinates to prevent the user from panning the visual completely off-screen.

## 2. Mathematical Architecture & Geometry

### Polygon Generation
The coordinate space is calculated via `createRegularPolygon`. It constructs an n-sided regular polygon using standard polar-to-cartesian conversions:
* Starts the first vertex at the 12 o'clock position by applying a `-PI / 2` starting angle offset.
* Calculates subsequent vertices by rotating clockwise: `angle = -Math.PI / 2 + (i * 2 * Math.PI) / sides`.
* Returns an array of `Point` interfaces defining the vertices relative to an origin of `(0, 0)`.

### Geometric Mapping (Barycentric to Cartesian)
Gas records are mapped onto the 2D Cartesian plane using a generalized barycentric coordinate system via `barycentricToCartesian`:
* Iterates through the ordered configuration axes to extract the raw values (`weights`).
* Calculates the cartesian point by computing the weighted sum of the polygon's vertices: `x += (weight / total) * point.x` and `y += (weight / total) * point.y`.
* If the sum of all weights is zero, it safely falls back to the origin `(0, 0)`.

### Edge Kinematics
The function `getPolygonEdges` derives the properties of the perimeter for rendering ticks and axes. For each edge:
* Calculates the normalized direction vector `(dx / length, dy / length)`.
* Computes the outward-facing normal vector assuming clockwise winding: `x: -direction.y, y: direction.x`. This normal is subsequently used to project labels and tick marks perpendicularly away from the polygon boundaries.

## 3. Data Normalization & Parsing

### Data Extraction
The `parseData` extraction engine handles the Power BI `DataView`.
* Dynamically maps the input columns by searching the `roles` dictionary against the `AxisConfig` required by the active triangle.
* Constructs `ParsedDataPoint` objects associating chronologically sorted dates with n-dimensional `GasRecord` dictionaries.
* Drops the rendering request by returning an empty array if any configured axis index is unresolved (`index === -1`).

### Normalization
The `normalizeData` function processes n-dimensional gas datasets.
* It computes the total sum of all parameters in the record.
* If `total === 0`, it initializes all configured keys to `0`.
* Otherwise, it applies standard percentage normalization: `(input[key] / total) * 100`.

## 4. Fault Region Classification
Unlike coordinate rendering, fault determination does not rely on geometric point-in-polygon calculations. Classification is executed via deterministic rule evaluation in `classifyFault`.

* The engine iterates linearly through the array of `RegionConfig` objects provided by the active configuration.
* For each region, it evaluates an attached boolean programmatic function (`condition(data)`) against the *normalized* `GasRecord`.
* The system operates on a "first match wins" strategy, returning the associated `FaultType` key immediately upon a `true` evaluation.
* Visual boundaries (`vertices`) define the colored backgrounds, whereas these programmatic checks evaluate the raw data independent of rendering limits.

## 5. Data Mapping & Formatting

### Capability Definitions
The input schema is defined in `capabilities.json`, specifying the following data roles:
* **Grouping**: `date` (Chronological sorting index).
* **Measures**: `ch4`, `c2h4`, `c2h2`, `h2`, `c2h6` (Gas concentration inputs).

### User Configuration Surface
`settings.ts` bridges the properties object to user-configurable UI components.
* **Legend (`legendText`)**: Contains a global visibility toggle (`show`) and string input definitions mapping configuration keys (e.g., `PD_text`) to custom labels.
* **Segments (`regionColors`)**: Provides individual `ColorPicker` controls for every fault type (e.g., `PD`, `T1`, `DT`), coupled with a global transparency percentage controller.
* **Connector (`pathSettings`)**: Toggles the trajectory lines between chronological points, adjusting thickness and color.
* **Data Points (`pointSettings`)**: Differentiates the styling (Size, Color) between historical points and the most recent reading (Latest Point).