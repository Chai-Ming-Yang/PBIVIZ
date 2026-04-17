"use strict";

import powerbi from "powerbi-visuals-api";
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;

import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { VisualFormattingSettingsModel } from "./settings";

import * as d3 from "d3";
import { GLOBAL_CONFIG, PENTAGON_CONFIGS, PentagonConfig } from "./config";
import {
    Point,
    barycentricToCartesian,
    getDistance
} from "./utils/geometry";
import { classifyFault } from "./utils/classifier";
import { parseData, ParsedDataPoint } from "./utils/dataParser";
import { drawShape } from "./utils/shapes";
import { normalizeData } from "./utils/normalizer";

export class Visual implements IVisual {

    private root: HTMLElement;
    private uiLayer!: HTMLDivElement;
    private tooltip!: HTMLDivElement;
    private legendContainer!: HTMLDivElement;
    private zoomSlider!: HTMLInputElement;

    private svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    private centerGroup!: d3.Selection<SVGGElement, unknown, null, undefined>;
    private viewportGroup!: d3.Selection<SVGGElement, unknown, null, undefined>;
    private geometryGroup!: d3.Selection<SVGGElement, unknown, null, undefined>;

    private zoomLevel: number = GLOBAL_CONFIG.zoom.default;
    private translateX: number = 0;
    private translateY: number = 0;
    private width: number = 0;
    private height: number = 0;
    private showLegendState: boolean = true;
    
    private activePentagon: string = "P1";
    private lastUpdateOptions!: VisualUpdateOptions;
    private toggleContainer!: HTMLDivElement;
    private warningText!: HTMLDivElement;

    private formattingSettings!: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;

    constructor(options: VisualConstructorOptions) {
        this.root = options.element;
        this.root.style.position = "relative";

        this.formattingSettingsService = new FormattingSettingsService();

        // CRITICAL FIX: Instantiate default settings so the formatting pane doesn't crash on load
        this.formattingSettings = new VisualFormattingSettingsModel();

        this.initializeUILayer();
        this.initializeCanvasLayer();
        this.attachInteractions();
    }

    private initializeUILayer(): void {
        this.uiLayer = document.createElement("div");
        Object.assign(this.uiLayer.style, {
            position: "absolute", top: "0", left: "0", right: "0", bottom: "0",
            pointerEvents: "none", zIndex: "10"
        });

        this.legendContainer = document.createElement("div");
        Object.assign(this.legendContainer.style, {
            position: "absolute", top: "10px", left: "10px", pointerEvents: "auto",
            background: "rgba(255,255,255,0.9)", padding: "8px", borderRadius: "4px", fontSize: "12px"
        });
        this.uiLayer.appendChild(this.legendContainer);

        this.tooltip = document.createElement("div");
        Object.assign(this.tooltip.style, {
            position: "absolute", pointerEvents: "none", background: "rgba(0,0,0,0.85)",
            color: "#fff", padding: "10px 14px", fontSize: "14px", lineHeight: "1.5",
            borderRadius: "6px", boxShadow: "0px 4px 8px rgba(0,0,0,0.4)", display: "none", zIndex: "20"
        });
        this.root.appendChild(this.tooltip);

        this.zoomSlider = document.createElement("input");
        this.zoomSlider.type = "range";
        this.zoomSlider.min = GLOBAL_CONFIG.zoom.min.toString();
        this.zoomSlider.max = GLOBAL_CONFIG.zoom.max.toString();
        this.zoomSlider.step = "0.1";
        this.zoomSlider.value = GLOBAL_CONFIG.zoom.default.toString();
        Object.assign(this.zoomSlider.style, {
            position: "absolute", bottom: "10px", left: "50%", transform: "translateX(-50%)",
            pointerEvents: "auto"
        });
        this.uiLayer.appendChild(this.zoomSlider);

        this.toggleContainer = document.createElement("div");
        Object.assign(this.toggleContainer.style, {
            position: "absolute", top: "10px", right: "10px", pointerEvents: "auto",
            display: "flex", gap: "6px"
        });

        ["P1", "P2"].forEach(type => {
            const btn = document.createElement("button");
            btn.innerText = type;
            Object.assign(btn.style, {
                padding: "4px 14px", cursor: "pointer", border: "1px solid #ccc",
                background: this.activePentagon === type ? "#0078d4" : "#f4f4f4",
                color: this.activePentagon === type ? "#fff" : "#333",
                fontWeight: "bold", borderRadius: "4px", fontSize: "14px",
                transition: "background 0.2s"
            });
            btn.onclick = () => {
                this.activePentagon = type;
                Array.from(this.toggleContainer.children).forEach((child, i) => {
                    const el = child as HTMLElement;
                    const t = ["P1", "P2"][i];
                    el.style.background = this.activePentagon === t ? "#0078d4" : "#f4f4f4";
                    el.style.color = this.activePentagon === t ? "#fff" : "#333";
                });
                if (this.lastUpdateOptions) this.update(this.lastUpdateOptions);
            };
            this.toggleContainer.appendChild(btn);
        });
        this.uiLayer.appendChild(this.toggleContainer);

        this.warningText = document.createElement("div");
        Object.assign(this.warningText.style, {
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            color: "#cc0000", fontSize: "14px", fontWeight: "bold", display: "none",
            background: "rgba(255, 255, 255, 0.95)", padding: "16px 24px", 
            border: "2px solid #cc0000", borderRadius: "6px", textAlign: "center",
            boxShadow: "0px 4px 12px rgba(0,0,0,0.15)", whiteSpace: "pre-wrap"
        });
        this.uiLayer.appendChild(this.warningText);

        this.root.appendChild(this.uiLayer);
    }

    private initializeCanvasLayer(): void {
        this.svg = d3.select(this.root).append("svg")
            .style("position", "absolute").style("top", "0").style("left", "0").style("z-index", "1");

        // Hierarchy restructured: Centering is absolute, pan/zoom applies within the centered context
        this.centerGroup = this.svg.append("g");
        this.viewportGroup = this.centerGroup.append("g");
        this.geometryGroup = this.viewportGroup.append("g").attr("transform", "scale(1, -1)");;

        const defs = this.geometryGroup.append("defs");

        defs.append("marker")
            .attr("id", "axis-arrowhead")
            .attr("viewBox", "0 0 10 10")
            .attr("refX", 9).attr("refY", 5)
            .attr("markerWidth", 6).attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path").attr("d", "M 0 1.5 L 10 5 L 0 8.5 Z").attr("fill", "black");

        defs.append("marker")
            .attr("id", "path-arrowhead")
            .attr("viewBox", "0 0 10 10")
            .attr("refX", 20).attr("refY", 5)
            .attr("markerWidth", 5).attr("markerHeight", 5)
            .attr("orient", "auto")
            .append("path").attr("d", "M 0 0 L 10 5 L 0 10 Z").attr("fill", "#555");
    }

    private getSettingsValue<T>(objects: any, objectName: string, propertyName: string, defaultValue: T): T {
        if (objects && objects[objectName] && objects[objectName][propertyName] !== undefined) {
            const val = objects[objectName][propertyName];
            if (val && val.solid && val.solid.color !== undefined) {
                return val.solid.color as unknown as T;
            }
            return val as T;
        }
        return defaultValue;
    }

    private attachInteractions(): void {
        this.zoomSlider.addEventListener("input", () => {
            this.zoomLevel = parseFloat(this.zoomSlider.value);
            this.applyTransform();
        });

        this.root.addEventListener("wheel", (event: WheelEvent) => {
            event.preventDefault();
            const delta = -event.deltaY * 0.001;
            this.zoomLevel = Math.min(GLOBAL_CONFIG.zoom.max, Math.max(GLOBAL_CONFIG.zoom.min, this.zoomLevel + delta));
            this.zoomSlider.value = this.zoomLevel.toString();
            this.applyTransform();
        });

        let isDragging = false;
        let lastX = 0, lastY = 0;

        // Set the default cursor to indicate the canvas is draggable
        this.root.style.cursor = "grab";

        this.root.addEventListener("mousedown", (e) => {
            isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
            
            // Change to the closed fist when actively dragging
            this.root.style.cursor = "grabbing";
        });

        window.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            this.translateX += (e.clientX - lastX);
            this.translateY += (e.clientY - lastY);
            lastX = e.clientX;
            lastY = e.clientY;
            this.applyTransform();
        });

        window.addEventListener("mouseup", () => { 
            isDragging = false; 
            
            // Revert back to the open hand when the mouse is released
            this.root.style.cursor = "grab";
        });
    }

    private applyTransform(): void {
        // Fallback protection if width/height aren't set yet
        if (!this.width || !this.height) return;

        // Calculate the absolute maximum distance the canvas can be dragged 
        // based on how far it is zoomed in relative to the viewport size.
        // If zoom is 1x, maxPan is 0 (locked). If zoom is 2x, maxPan is half the canvas.
        const maxPanX = Math.max(0, (this.width * this.zoomLevel - this.width) / 2);
        const maxPanY = Math.max(0, (this.height * this.zoomLevel - this.height) / 2);

        // Clamp the translations to the strict bounding box
        this.translateX = Math.max(-maxPanX, Math.min(maxPanX, this.translateX));
        this.translateY = Math.max(-maxPanY, Math.min(maxPanY, this.translateY));

        this.viewportGroup.attr("transform", `translate(${this.translateX}, ${this.translateY}) scale(${this.zoomLevel})`);
    }

    public update(options: VisualUpdateOptions): void {
        this.lastUpdateOptions = options;
        this.width = options.viewport.width;
        this.height = options.viewport.height;

        this.svg.attr("width", this.width).attr("height", this.height);
        this.centerGroup.attr("transform", `translate(${this.width / 2}, ${this.height / 2})`);

        const dataView = options.dataViews?.[0];
        const objects = dataView?.metadata?.objects;

        // CRITICAL FIX: Only populate if dataView exists, otherwise keep the default model
        if (dataView) {
            this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(VisualFormattingSettingsModel, options.dataViews);
        }

        // Force native D3 UI toggle state (bypassing the static formatting pane dropdown)
        const activeConfig: PentagonConfig = PENTAGON_CONFIGS[this.activePentagon] || PENTAGON_CONFIGS["P1"];

        // Schema Validation: Ensure mapped columns satisfy the active pentagon
        let missingGases: string[] = [];
        
        if (dataView?.table?.columns) {
            missingGases = activeConfig.axes
                .filter(axis => !dataView!.table!.columns.some(c => c.roles && c.roles[axis.key]))
                .map(a => a.label.replace(/[^A-Za-z0-9₂₄₆]/g, '').trim()); 
        } else {
            missingGases = activeConfig.axes.map(a => a.label.replace(/[^A-Za-z0-9₂₄₆]/g, '').trim());
        }

        if (missingGases.length > 0) {
            this.warningText.innerText = `Missing Required Data\n\nPlease map the following columns to view ${this.activePentagon}:\n${missingGases.join(", ")}`;
            this.warningText.style.display = "block";
            this.geometryGroup.selectAll(".transient-layer").remove();
            this.legendContainer.style.display = "none";
            return; // Abort render cycle
        } else {
            this.warningText.style.display = "none";
        }

        this.showLegendState = this.getSettingsValue<boolean>(objects, "legendText", "show", true);
        this.legendContainer.style.display = this.showLegendState ? "block" : "none";

        const regionSettings = {
            transparency: this.getSettingsValue<number>(objects, "regionColors", "transparency", 30)
        };

        const pathSettings = {
            show: this.getSettingsValue<boolean>(objects, "pathSettings", "show", true),
            color: this.getSettingsValue<string>(objects, "pathSettings", "color", "#555555"),
            thickness: this.getSettingsValue<number>(objects, "pathSettings", "thickness", 1.5)
        };

        const pointSettings = {
            latestColor: this.getSettingsValue<string>(objects, "pointSettings", "latestColor", "#CC0000"),
            latestSize: this.getSettingsValue<number>(objects, "pointSettings", "latestSize", 8),
            otherColor: this.getSettingsValue<string>(objects, "pointSettings", "otherColor", "#666666"),
            otherSize: this.getSettingsValue<number>(objects, "pointSettings", "otherSize", 5)
        };

        const size = Math.min(this.width, this.height) * 0.4;
        
        // Base IEC Pentagon outer boundary coordinates (unscaled mathematical model)
        const basePolygon: Point[] = [
            { x: 0, y: 40 },
            { x: 38, y: 12 },        // Matches D1 extreme right vertex
            { x: 23.5, y: -32.4 },   // Matches T3 extreme bottom-right vertex
            { x: -23.5, y: -32.4 },  // Matches T1/O extreme bottom-left vertex
            { x: -38, y: 12.4 }      // Matches S extreme left vertex
        ];
        
        // Scale factor: IEC standard caps at y=40, we scale this to fit your D3 viewport
        const scaleFactor = size / 40;
        // Invert the Y-axis for D3/SVG rendering (-v.y) while keeping X standard
        const renderPolygon: Point[] = basePolygon.map(v => ({ x: v.x * scaleFactor, y: v.y * scaleFactor }));

        this.geometryGroup.selectAll(".transient-layer").remove();

        const regionsLayer = this.geometryGroup.append("g").attr("class", "transient-layer");
        const outlineLayer = this.geometryGroup.append("g").attr("class", "transient-layer");
        const axesLayer = this.geometryGroup.append("g").attr("class", "transient-layer");
        const labelsLayer = this.geometryGroup.append("g").attr("class", "transient-layer");
        const plotsLayer = this.geometryGroup.append("g").attr("class", "transient-layer");

        this.svg.select("#path-arrowhead path")
            .attr("fill", pathSettings.color)
            .attr("d", `M 0 0 L 10 5 L 0 10 Z`);

        // Render pass with active configuration
        this.renderLegend(activeConfig);
        this.drawRegions(regionsLayer, scaleFactor, regionSettings.transparency, objects, activeConfig);
        this.drawPolygonOutline(outlineLayer, renderPolygon);
        this.drawAxes(axesLayer, renderPolygon, activeConfig);
        this.drawRegionLabels(labelsLayer, renderPolygon, activeConfig);

        if (dataView) {
            const parsed = parseData(dataView, activeConfig.axes);
            this.drawPlots(plotsLayer, parsed, basePolygon, renderPolygon, pathSettings, pointSettings, activeConfig);
        }

        this.applyTransform();
    }

    private renderLegend(config: PentagonConfig): void {
        this.legendContainer.replaceChildren();

        const textCard = this.formattingSettings.legendTextCard;
        const colorsCard = this.formattingSettings.segmentsCard;
        
        // Track which fault keys have already been added to the legend
        const seenKeys = new Set<string>();

        config.regions.forEach(region => {
            // If we already rendered this key (e.g., the second "O" region), skip it
            if (seenKeys.has(region.key)) return;
            seenKeys.add(region.key);

            const row = document.createElement("div");
            Object.assign(row.style, { display: "flex", alignItems: "center", marginBottom: "6px" });

            const svgContainer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svgContainer.setAttribute("width", "16");
            svgContainer.setAttribute("height", "16");
            Object.assign(svgContainer.style, { marginRight: "8px", overflow: "visible" });

            // Pull dynamically from the Formatting Model to enforce settings.ts defaults
            const safeCard = colorsCard as unknown as Record<string, { value: { value: string } }>;
            const colorProp = safeCard[region.key];
            const regionColor = colorProp ? colorProp.value.value : region.defaultColor;

            const iconGroup = d3.select(svgContainer).append("g");
            drawShape(iconGroup, "square", 8, 8, regionColor, 6);

            const textProp = (textCard as any)[`${region.key}_text`];
            const customText = textProp ? textProp.value : region.label;

            const label = document.createElement("span");
            label.innerText = customText;

            row.append(svgContainer, label);
            this.legendContainer.appendChild(row);
        });
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        try {
            return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
        } catch (error) {
            // This will expose exactly which property is crashing the bridge
            console.error("🚨 FORMATTING MODEL CRASH 🚨:", error);
            throw error;
        }
    }

    private drawPolygonOutline(layer: d3.Selection<SVGGElement, unknown, null, undefined>, polygon: Point[]): void {
        // Map points to explicit SVG Move (M) and Line (L) commands, ending with Close (Z)
        const pathData = polygon.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(" ") + " Z";
        
        layer.append("path")
            .attr("d", pathData)
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("stroke-linejoin", "round"); // Prevents sharp corner clipping
    }

    private drawRegions(layer: d3.Selection<SVGGElement, unknown, null, undefined>, scaleFactor: number, transparency: number, objects: any, config: PentagonConfig): void {
        const opacity = Math.max(0, Math.min(1, 1 - (transparency / 100)));
        const colorsCard = this.formattingSettings.segmentsCard;

        config.regions.forEach(region => {
            if (!region.cartesianVertices || region.cartesianVertices.length === 0) return;

            const colorProp = (colorsCard as any)[region.key];
            const regionColor = colorProp ? colorProp.value.value : region.defaultColor;

            const pointsStr = region.cartesianVertices.map(p => {
                return `${p.x * scaleFactor},${p.y * scaleFactor}`;
            }).join(" ");

            layer.append("polygon")
                .attr("points", pointsStr)
                .attr("fill", regionColor)
                .attr("fill-opacity", opacity)
                .attr("stroke", "#666")
                .attr("stroke-width", 0.5);
        });
    }

    private drawAxes(layer: d3.Selection<SVGGElement, unknown, null, undefined>, polygon: Point[], config: PentagonConfig): void {
        polygon.forEach((vertex, i) => {
            const axisConfig = config.axes[i];
            if (!axisConfig) return;

            // Calculate the distance from center (0,0) to find the outward direction
            const length = Math.sqrt(vertex.x * vertex.x + vertex.y * vertex.y);
            const dirX = vertex.x / length;
            const dirY = vertex.y / length;

            // Push the label 20 pixels outward from the vertex
            const labelDist = 20;
            const labelX = vertex.x + dirX * labelDist;
            const labelY = vertex.y + dirY * labelDist;

            layer.append("text")
                // Un-flip the text to counter the SVG Cartesian inversion
                .attr("transform", `translate(${labelX}, ${labelY}) scale(1, -1)`)
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "middle")
                .attr("font-size", "13px")
                .attr("font-weight", "bold")
                .text(axisConfig.label);
        });
    }

    private drawRegionLabels(layer: d3.Selection<SVGGElement, unknown, null, undefined>, polygon: Point[], config: PentagonConfig): void {
        config.regionLabels.forEach(labelConf => {
            // 1. Calculate the anchor point directly from the defined gas percentages
            const anchorPoint = barycentricToCartesian(labelConf.gas, polygon, config.axes);
            
            // 2. Apply explicit offsets defined in config
            const finalX = anchorPoint.x + labelConf.offset.x;
            const finalY = anchorPoint.y + labelConf.offset.y;

            // 3. Draw a connecting line if the label is pushed externally
            if (labelConf.isExternal) {
                layer.append("line")
                    .attr("x1", anchorPoint.x).attr("y1", anchorPoint.y)
                    .attr("x2", finalX).attr("y2", finalY)
                    .attr("stroke", "black")
                    .attr("stroke-width", 1);
            }

            // 4. Create the group and un-flip it for SVG cartesian space
            const labelGroup = layer.append("g")
                .attr("transform", `translate(${finalX}, ${finalY}) scale(1, -1)`);

            // 5. Draw the text first so we can measure its bounding box
            const textNode = labelGroup.append("text")
                .attr("x", 0).attr("y", 1) // Slight Y nudge for vertical centering
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "middle")
                .attr("font-size", "12px")
                .attr("font-weight", "bold")
                .attr("font-family", "sans-serif")
                .text(labelConf.key);

            // 6. Measure the text and draw the background box BEFORE the text
            const bbox = (textNode.node() as SVGTextElement).getBBox();
            const paddingX = 8, paddingY = 4;
            const boxWidth = bbox.width + paddingX;
            const boxHeight = bbox.height + paddingY;

            labelGroup.insert("rect", "text")
                .attr("x", -boxWidth / 2).attr("y", -boxHeight / 2)
                .attr("width", boxWidth).attr("height", boxHeight)
                .attr("fill", "white").attr("fill-opacity", 0.9)
                .attr("stroke", "black")
                .attr("stroke-width", 1)
                .attr("rx", 3);
        });
    }

    private drawPlots(layer: d3.Selection<SVGGElement, unknown, null, undefined>, dataPoints: ParsedDataPoint[], basePolygon: Point[], renderPolygon: Point[], pathSettings: any, pointSettings: any, config: PentagonConfig): void {
        const pathLayer = layer.append("g");
        const markerLayer = layer.append("g");

        let previousPoint: Point | null = null;

        dataPoints.forEach((dp, index) => {
            const isLatest = index === dataPoints.length - 1;
            const normalized = normalizeData(dp.values);
            
            // Generate unscaled coord for strict mathematical checks against IEC boundaries
            const unscaledCoord = barycentricToCartesian(normalized, basePolygon, config.axes);
            const fault = classifyFault(normalized, config.regions, unscaledCoord);
            
            // Generate scaled coord for actual D3 SVG rendering
            const coord = barycentricToCartesian(normalized, renderPolygon, config.axes);

            if (pathSettings.show && previousPoint && getDistance(coord, previousPoint) > GLOBAL_CONFIG.declutterThreshold) {
                pathLayer.append("line")
                    .attr("x1", previousPoint.x).attr("y1", previousPoint.y)
                    .attr("x2", coord.x).attr("y2", coord.y)
                    .attr("stroke", pathSettings.color)
                    .attr("stroke-width", pathSettings.thickness)
                    .attr("marker-end", "url(#path-arrowhead)");
            }

            previousPoint = coord;

            const shapeType = isLatest ? "triangle" : "circle";
            const shapeColor = isLatest ? pointSettings.latestColor : pointSettings.otherColor;
            const shapeSize = isLatest ? pointSettings.latestSize : pointSettings.otherSize;

            const pointGroup = markerLayer.append("g")
                .attr("transform", `translate(${coord.x}, ${coord.y}) scale(1, -1) translate(${-coord.x}, ${-coord.y})`);;

            pointGroup.append("circle")
                .attr("cx", coord.x).attr("cy", coord.y)
                .attr("r", 3)
                .attr("fill", "none")
                .attr("pointer-events", "all");

            drawShape(pointGroup, shapeType, coord.x, coord.y, shapeColor, shapeSize);

            pointGroup.on("mouseover", (event: MouseEvent) => {
                const el = event.currentTarget as SVGGElement;
                d3.select(el).raise();
                d3.select(el).transition().duration(150).style("filter", "brightness(1.6)");

                this.tooltip.style.display = "block";
                this.tooltip.replaceChildren();

                const dateDiv = document.createElement("div");
                const dateLabel = document.createElement("b");
                dateLabel.textContent = "Samp Date: ";
                dateDiv.appendChild(dateLabel);
                dateDiv.appendChild(document.createTextNode(dp.date.toISOString().split("T")[0]));
                this.tooltip.appendChild(dateDiv);

                const faultDiv = document.createElement("div");
                const faultLabel = document.createElement("b");
                faultLabel.textContent = "Fault: ";
                faultDiv.appendChild(faultLabel);
                faultDiv.appendChild(document.createTextNode(fault as string));
                this.tooltip.appendChild(faultDiv);

                config.axes.forEach(axis => {
                    const valDiv = document.createElement("div");
                    const normalizedVal = normalized[axis.key] !== undefined ? normalized[axis.key].toFixed(2) : "0.00";
                    valDiv.textContent = `${axis.label.replace(/[^A-Za-z0-9₂₄₆]/g, '').trim()}: ${normalizedVal}%`;
                    this.tooltip.appendChild(valDiv);
                });
            })
                .on("mousemove", (event: MouseEvent) => {
                    // Get the current dimensions of the tooltip box
                    const tooltipWidth = this.tooltip.offsetWidth;
                    const tooltipHeight = this.tooltip.offsetHeight;

                    // Default positions (bottom-right of cursor)
                    let leftPos = event.clientX + 15;
                    let topPos = event.clientY + 15;

                    // Collision Detection: If it bleeds off the right edge, flip it left
                    if (leftPos + tooltipWidth > this.width) {
                        leftPos = event.clientX - tooltipWidth - 15;
                    }

                    // Collision Detection: If it bleeds off the bottom edge, flip it up
                    if (topPos + tooltipHeight > this.height) {
                        topPos = event.clientY - tooltipHeight - 15;
                    }

                    this.tooltip.style.left = `${leftPos}px`;
                    this.tooltip.style.top = `${topPos}px`;
                })
                .on("mouseout", (event: MouseEvent) => {
                    const el = event.currentTarget as SVGGElement;
                    d3.select(el).transition().duration(150).style("filter", null);
                    this.tooltip.style.display = "none";
                });
        });
    }
}