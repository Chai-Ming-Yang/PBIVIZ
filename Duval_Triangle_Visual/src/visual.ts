"use strict";

import powerbi from "powerbi-visuals-api";
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;

import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { VisualFormattingSettingsModel } from "./settings";

import * as d3 from "d3";
import { GLOBAL_CONFIG, TRIANGLE_CONFIGS, TriangleConfig } from "./config";
import {
    Point,
    createRegularPolygon,
    barycentricToCartesian,
    interpolate,
    getPolygonEdges,
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
    
    private activeTriangle: string = "1";
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

        ["1", "4", "5"].forEach(type => {
            const btn = document.createElement("button");
            btn.innerText = type;
            Object.assign(btn.style, {
                padding: "4px 14px", cursor: "pointer", border: "1px solid #ccc",
                background: this.activeTriangle === type ? "#0078d4" : "#f4f4f4",
                color: this.activeTriangle === type ? "#fff" : "#333",
                fontWeight: "bold", borderRadius: "4px", fontSize: "14px",
                transition: "background 0.2s"
            });
            btn.onclick = () => {
                this.activeTriangle = type;
                Array.from(this.toggleContainer.children).forEach((child, i) => {
                    const el = child as HTMLElement;
                    const t = ["1", "4", "5"][i];
                    el.style.background = this.activeTriangle === t ? "#0078d4" : "#f4f4f4";
                    el.style.color = this.activeTriangle === t ? "#fff" : "#333";
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
        this.geometryGroup = this.viewportGroup.append("g");

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

        this.root.addEventListener("mousedown", (e) => {
            isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
        });

        window.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            this.translateX += (e.clientX - lastX);
            this.translateY += (e.clientY - lastY);
            lastX = e.clientX;
            lastY = e.clientY;
            this.applyTransform();
        });

        window.addEventListener("mouseup", () => { isDragging = false; });
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
        const activeConfig: TriangleConfig = TRIANGLE_CONFIGS[this.activeTriangle] || TRIANGLE_CONFIGS["1"];

        // Schema Validation: Ensure mapped columns satisfy the active triangle
        let missingGases: string[] = [];
        
        if (dataView?.table?.columns) {
            missingGases = activeConfig.axes
                .filter(axis => !dataView!.table!.columns.some(c => c.roles && c.roles[axis.key]))
                .map(a => a.label.replace(/[^A-Za-z0-9₂₄₆]/g, '').trim()); // Accurately extracts CH₄, H₂, etc.
        } else {
            // If Power BI passes no table data, ALL required axes are technically missing
            missingGases = activeConfig.axes.map(a => a.label.replace(/[^A-Za-z0-9₂₄₆]/g, '').trim());
        }

        if (missingGases.length > 0) {
            this.warningText.innerText = `Missing Required Data\n\nPlease map the following columns to view DT${this.activeTriangle}:\n${missingGases.join(", ")}`;
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
        const polygon = createRegularPolygon(activeConfig.axes.length, size);

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
        this.renderLegend(objects, activeConfig);
        this.drawRegions(regionsLayer, polygon, regionSettings.transparency, objects, activeConfig);
        this.drawPolygonOutline(outlineLayer, polygon);
        this.drawAxes(axesLayer, polygon, activeConfig);
        this.drawRegionLabels(labelsLayer, polygon, activeConfig);

        if (dataView) {
            const parsed = parseData(dataView, activeConfig.axes);
            this.drawPlots(plotsLayer, parsed, polygon, pathSettings, pointSettings, activeConfig);
        }

        this.applyTransform();
    }

    private renderLegend(objects: any, config: TriangleConfig): void {
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
            const colorProp = (colorsCard as any)[region.key];
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
        const pointsStr = polygon.map(p => `${p.x},${p.y}`).join(" ");
        layer.append("polygon")
            .attr("points", pointsStr)
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 2);
    }

    private drawRegions(layer: d3.Selection<SVGGElement, unknown, null, undefined>, polygon: Point[], transparency: number, objects: any, config: TriangleConfig): void {
        const opacity = Math.max(0, Math.min(1, 1 - (transparency / 100)));
        const colorsCard = this.formattingSettings.segmentsCard;

        config.regions.forEach(region => {
            if (!region.vertices) return;

            // Pull dynamically from the Formatting Model to enforce settings.ts defaults
            const colorProp = (colorsCard as any)[region.key];
            const regionColor = colorProp ? colorProp.value.value : region.defaultColor;

            const pointsStr = region.vertices.map(gas => {
                const p = barycentricToCartesian(gas, polygon, config.axes);
                return `${p.x},${p.y}`;
            }).join(" ");

            layer.append("polygon")
                .attr("points", pointsStr)
                .attr("fill", regionColor)
                .attr("fill-opacity", opacity)
                .attr("stroke", "#666")
                .attr("stroke-width", 0.5);
        });
    }

    private drawAxes(layer: d3.Selection<SVGGElement, unknown, null, undefined>, polygon: Point[], config: TriangleConfig): void {
        const edges = getPolygonEdges(polygon);

        edges.forEach((edge, i) => {
            // FIX: Edge i goes from Vertex i to Vertex i+1.
            // Therefore, the gas increasing from 0 to 100 along this edge belongs to Vertex i+1.
            const axisIndex = (i + 1) % edges.length;
            const axisConfig = config.axes[axisIndex];
            
            if (!axisConfig) return;

            const mid = interpolate(edge.start, edge.end, 0.5);
            const arrowLength = edge.length * 0.20;
            const labelDist = -30;
            const labelPt = { x: mid.x + edge.normal.x * labelDist, y: mid.y + edge.normal.y * labelDist };

            layer.append("text")
                .attr("x", labelPt.x)
                .attr("y", labelPt.y)
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "middle")
                .attr("font-size", "12px")
                .text(axisConfig.label);

            const arrowStart = interpolate(edge.start, edge.end, 0.55);
            const arrowStartOffset = { x: arrowStart.x + edge.normal.x * labelDist, y: arrowStart.y + edge.normal.y * labelDist };
            const arrowEndPt = { x: arrowStartOffset.x + edge.direction.x * arrowLength, y: arrowStartOffset.y + edge.direction.y * arrowLength };

            layer.append("line")
                .attr("x1", arrowStartOffset.x).attr("y1", arrowStartOffset.y)
                .attr("x2", arrowEndPt.x).attr("y2", arrowEndPt.y)
                .attr("stroke", "black").attr("stroke-width", 1.5)
                .attr("marker-end", "url(#axis-arrowhead)");

            const prevEdge = edges[(i - 1 + edges.length) % edges.length];
            const tickDir = { x: -prevEdge.direction.x, y: -prevEdge.direction.y };

            for (let tIdx = 1; tIdx <= 9; tIdx++) {
                const t = tIdx / 10;
                const point = interpolate(edge.start, edge.end, t);
                const tickSize = 8;

                layer.append("line")
                    .attr("x1", point.x).attr("y1", point.y)
                    .attr("x2", point.x + tickDir.x * tickSize)
                    .attr("y2", point.y + tickDir.y * tickSize)
                    .attr("stroke", "black").attr("stroke-width", 1);

                const percent = tIdx * 10;
                if ([20, 40, 60, 80].includes(percent)) {
                    layer.append("text")
                        .attr("x", point.x - tickDir.x * 8)
                        .attr("y", point.y - tickDir.y * 8)
                        .attr("text-anchor", "middle")
                        .attr("alignment-baseline", "middle")
                        .attr("font-size", "10px")
                        .text(percent.toString());
                }
            }
        });
    }

    private drawRegionLabels(layer: d3.Selection<SVGGElement, unknown, null, undefined>, polygon: Point[], config: TriangleConfig): void {
        config.regionLabels.forEach(labelConf => {
            const anchorPoint = barycentricToCartesian(labelConf.gas, polygon, config.axes);
            const finalX = anchorPoint.x + labelConf.offset.x;
            const finalY = anchorPoint.y + labelConf.offset.y;

            if (labelConf.isExternal) {
                layer.append("line")
                    .attr("x1", anchorPoint.x).attr("y1", anchorPoint.y)
                    .attr("x2", finalX).attr("y2", finalY)
                    .attr("stroke", "black").attr("stroke-width", 1);
            }

            const labelGroup = layer.append("g").attr("transform", `translate(${finalX}, ${finalY})`);

            // 1. Draw the text first so we can measure it
            const textNode = labelGroup.append("text")
                .attr("x", 0).attr("y", 1)
                .attr("text-anchor", "middle").attr("alignment-baseline", "middle")
                .attr("font-size", "9px").attr("font-family", "sans-serif")
                .text(labelConf.key);

            // 2. Measure the physical width/height of the rendered text
            const bbox = (textNode.node() as SVGTextElement).getBBox();

            // 3. Add a little padding around the text
            const paddingX = 6;
            const paddingY = 4;
            const boxWidth = bbox.width + paddingX;
            const boxHeight = bbox.height + paddingY;

            // 4. Insert the rectangle BEFORE the text so it acts as a background
            labelGroup.insert("rect", "text")
                .attr("x", -boxWidth / 2).attr("y", -boxHeight / 2)
                .attr("width", boxWidth).attr("height", boxHeight)
                .attr("fill", "white").attr("fill-opacity", 1)
                .attr("stroke", "black")
                .attr("stroke-width", 1).attr("rx", 2);
        });
    }

    private drawPlots(layer: d3.Selection<SVGGElement, unknown, null, undefined>, dataPoints: ParsedDataPoint[], polygon: Point[], pathSettings: any, pointSettings: any, config: TriangleConfig): void {
        const pathLayer = layer.append("g");
        const markerLayer = layer.append("g");

        let previousPoint: Point | null = null;

        dataPoints.forEach((dp, index) => {
            const isLatest = index === dataPoints.length - 1;
            const normalized = normalizeData(dp.values);
            const fault = classifyFault(normalized, config.regions);
            const coord = barycentricToCartesian(normalized, polygon, config.axes);

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

            const pointGroup = markerLayer.append("g");

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

                if (dp.extraTooltips && dp.extraTooltips.length > 0) {
                    this.tooltip.appendChild(document.createElement("hr"));
                    dp.extraTooltips.forEach(t => {
                        const tDiv = document.createElement("div");
                        const tLabel = document.createElement("b");
                        tLabel.textContent = `${t.name}: `;
                        tDiv.appendChild(tLabel);
                        tDiv.appendChild(document.createTextNode(String(t.value)));
                        this.tooltip.appendChild(tDiv);
                    });
                }
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