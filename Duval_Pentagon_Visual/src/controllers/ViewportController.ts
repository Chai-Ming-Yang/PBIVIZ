import * as d3 from "d3";
import { UIController, UIState } from "./UIController";

export class ViewportController {
    private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    private centerGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    private viewportGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    public geometryGroup: d3.Selection<SVGGElement, unknown, null, undefined>;

    private translateX: number = 0;
    private translateY: number = 0;
    public width: number = 0;
    public height: number = 0;

    constructor(private root: HTMLElement, private uiController: UIController) {
        this.svg = d3.select(this.root).append("svg")
            .style("position", "absolute").style("top", "0").style("left", "0").style("z-index", "1");

        this.centerGroup = this.svg.append("g");
        this.viewportGroup = this.centerGroup.append("g");
        
        // Pentagon specific: Cartesian Y-axis inversion
        this.geometryGroup = this.viewportGroup.append("g").attr("transform", "scale(1, -1)");

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

        this.attachInteractions();
    }

    private attachInteractions(): void {
        this.root.addEventListener("wheel", (event: WheelEvent) => {
            event.preventDefault();
            const delta = -event.deltaY * 0.001;
            this.uiController.updateZoomFromScroll(delta);
        });

        let isDragging = false;
        let lastX = 0, lastY = 0;

        this.root.style.cursor = "pointer";

        this.root.addEventListener("mousedown", (e) => {
            isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
            this.root.style.cursor = "grabbing";
        });

        window.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            this.translateX += (e.clientX - lastX);
            this.translateY += (e.clientY - lastY);
            lastX = e.clientX;
            lastY = e.clientY;
            this.applyTransform(this.uiController.getState());
        });

        window.addEventListener("mouseup", () => { 
            isDragging = false; 
            this.root.style.cursor = "pointer";
        });
    }

    public updateDimensions(width: number, height: number): void {
        this.width = width;
        this.height = height;
        this.svg.attr("width", width).attr("height", height);
        this.centerGroup.attr("transform", `translate(${width / 2}, ${height / 2})`);
    }

    public applyTransform(uiState: UIState): void {
        if (!this.width || !this.height) return;

        const zoomLevel = uiState.zoomLevel;
        const maxPanX = Math.max(0, (this.width * zoomLevel - this.width) / 2);
        const maxPanY = Math.max(0, (this.height * zoomLevel - this.height) / 2);

        this.translateX = Math.max(-maxPanX, Math.min(maxPanX, this.translateX));
        this.translateY = Math.max(-maxPanY, Math.min(maxPanY, this.translateY));

        this.viewportGroup.attr("transform", `translate(${this.translateX}, ${this.translateY}) scale(${zoomLevel})`);
    }

    public prepareLayers(pathSettings: { show: boolean, color: string }): {
        regionsLayer: d3.Selection<SVGGElement, unknown, null, undefined>,
        outlineLayer: d3.Selection<SVGGElement, unknown, null, undefined>,
        axesLayer: d3.Selection<SVGGElement, unknown, null, undefined>,
        labelsLayer: d3.Selection<SVGGElement, unknown, null, undefined>,
        plotsLayer: d3.Selection<SVGGElement, unknown, null, undefined>
    } {
        this.clearTransientLayers();

        const regionsLayer = this.geometryGroup.append("g").attr("class", "transient-layer");
        const outlineLayer = this.geometryGroup.append("g").attr("class", "transient-layer");
        const axesLayer = this.geometryGroup.append("g").attr("class", "transient-layer");
        const labelsLayer = this.geometryGroup.append("g").attr("class", "transient-layer");
        const plotsLayer = this.geometryGroup.append("g").attr("class", "transient-layer");

        this.svg.select("#path-arrowhead path")
            .attr("fill", pathSettings.color)
            .attr("d", `M 0 0 L 10 5 L 0 10 Z`);

        return { regionsLayer, outlineLayer, axesLayer, labelsLayer, plotsLayer };
    }

    public clearTransientLayers(): void {
        this.geometryGroup.selectAll(".transient-layer").remove();
    }
}