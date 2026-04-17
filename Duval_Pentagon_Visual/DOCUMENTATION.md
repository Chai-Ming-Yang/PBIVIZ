# Power BI Custom Visual: Duval Pentagon Documentation

## 1. Rendering Pipeline (`visual.ts`)
The visual follows a strict deterministic rendering pipeline synchronized with the Power BI `update` lifecycle event.

**Initialization (`constructor`)**
* **Layer Separation:** The DOM is bifurcated into an absolute-positioned HTML UI layer (`uiLayer` for tooltips, legends, warnings, and zoom controls) and an underlying SVG canvas layer.
* **Transform Hierarchy:** * `centerGroup`: Translates the origin `(0,0)` to the absolute center of the viewport `(width/2, height/2)`.
    * `viewportGroup`: Applies user-driven pan (`translateX`, `translateY`) and zoom (`scale(zoomLevel)`) transformations.
    * `geometryGroup`: Applies a `scale(1, -1)` transform. This inverts the standard SVG Y-axis (which runs top-to-bottom) into a standard Cartesian coordinate system (bottom-to-top) required for mathematical graphing.

**Update Cycle (`update` method)**
1.  **Schema Validation:** Cross-references mapped Power BI columns against the `activeConfig.axes`. If required gases are missing, execution aborts and a warning overlay is displayed.
2.  **Scaling:** Dynamically calculates `scaleFactor = Math.min(width, height) * 0.4 / 40`. The base IEC model uses an unscaled radius of 40; this standardizes it to fit 80% of the shortest viewport dimension.
3.  **Transient Layer Purge:** Clears existing geometric renders by removing all `.transient-layer` nodes.
4.  **Z-Indexed Rendering:** Executes drawing functions sequentially to enforce visual depth: Legend $\rightarrow$ Regions (Polygons) $\rightarrow$ Pentagon Outline $\rightarrow$ Axis Labels $\rightarrow$ Data Connector Paths $\rightarrow$ Data Markers.

## 2. Mathematical Architecture & Geometry
The visual translates n-dimensional gas concentrations into 2D Cartesian space using a Center of Mass (Weighted Centroid) algorithm.

**Coordinate Mapping (`geometry.ts`)**
The `barycentricToCartesian` function implements the projection. It calculates the linear combination of the polygon's vertices weighted by normalized gas percentages.
For a given data point with gas weights $w_i$, total weight $W = \sum w_i$, and polygon vertices $V_i = (x_i, y_i)$:
$$x = \sum_{i=1}^{n} \left( \frac{w_i}{W} \right) x_i$$
$$y = \sum_{i=1}^{n} \left( \frac{w_i}{W} \right) y_i$$
If $\sum w_i = 0$, the function returns the unweighted geometric centroid of the polygon to prevent division by zero or coordinate collapse.

**Geometry Evaluation**
The `getDistance` function evaluates spatial separation using standard Euclidean distance: $\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$. This is utilized in the rendering pipeline against `GLOBAL_CONFIG.declutterThreshold` to determine if connector paths should be drawn between chronologically adjacent points.

## 3. Data Normalization & Parsing
Data extraction and preprocessing bridge the raw Power BI `DataView` table to mathematical inputs.

**Extraction (`dataParser.ts`)**
* The `parseData` function maps the `AxisConfig` keys to the matching DataView column indices.
* It aggregates chronological groupings, converting row indices into standard JavaScript `Date` objects and numerical floats.
* The entire parsed dataset is chronologically sorted based on the primary timestamp `a.date.getTime() - b.date.getTime()`.

**Normalization (`normalizer.ts`)**
* Raw PPM (Parts Per Million) gas values are passed to `normalizeData`.
* It calculates relative percentages for each component across the defined axis set: $w_{norm} = \left( \frac{w_i}{\sum w} \right) \times 100$.

## 4. Fault Region Classification
The visual mathematically classifies standard fault types (PD, D1, D2, T1, T2, T3, T3-H, S, C, O) dynamically based on spatial plotting.

**Classification Engine (`classifier.ts` & `config.ts`)**
* The `classifyFault` function takes the normalized gas values and the unscaled Cartesian coordinates mapping. 
* It evaluates the array of bounded `RegionConfig` objects. It explicitly binds `this` to invoke the context-aware `condition` function on each region.

**Point-in-Polygon Algorithm (`geometry.ts`)**
* The region conditions utilize `isPointInPolygon`, which implements a Ray-Casting algorithm. 
* It projects a horizontal ray from the unscaled Cartesian coordinate along the positive X-axis and counts intersections with the region's boundary edges (defined by `cartesianVertices`). 
* An odd number of intersections strictly categorizes the point as inside the polygon. Unscaled coordinates are used to ensure the logic perfectly matches the defined IEC boundaries rather than the transient SVG scaled coordinates.

## 5. Data Mapping & Formatting
The integration with the Power BI host is defined via standard capability schemas and a robust property model.

**Schema Definitions (`capabilities.json`)**
* **Data Roles:** Requires one `Grouping` role (`date`) and five strictly typed `Measure` roles (`ch4`, `c2h4`, `c2h2`, `h2`, `c2h6`).
* **Objects:** Exposes declarative property groups for host-level modification: `legendText`, `regionColors`, `pathSettings`, and `pointSettings`.

**Property Model (`settings.ts`)**
The visual utilizes the `powerbi-visuals-utils-formattingmodel` to expose configurable states:
* `LegendTextCard`: Allows custom localized text overrides for static fault region labels.
* `SegmentsCard`: Maps user-defined Hex colors (`ColorPicker`) and global transparency (`NumUpDown`) to the underlying D3 polygon fill styles.
* `ConnectorCard` & `PointSettingsCard`: Dictates stroke characteristics, Boolean visibilities, and differentiates the physical dimensions and colorations of the most recent data plot (Triangle) versus historical traces (Circle).