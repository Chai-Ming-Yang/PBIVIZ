import * as d3 from "d3";
import { PentagonConfig } from "../config";
import { drawShape } from "../utils/shapes";

export class LegendRenderer {
    private container: HTMLDivElement;

    constructor(private root: HTMLElement) {
        this.container = document.createElement("div");
        Object.assign(this.container.style, {
            position: "absolute", top: "10px", left: "10px", pointerEvents: "auto",
            background: "rgba(255,255,255,0.9)", padding: "8px", borderRadius: "4px", fontSize: "12px",
            zIndex: "10", display: "none"
        });
        
        this.root.appendChild(this.container);
    }

    public toggle(show: boolean): void {
        this.container.style.display = show ? "block" : "none";
    }

    public render(config: PentagonConfig, segmentColors: Record<string, string>, textCardSettings: any): void {
        this.container.replaceChildren();
        
        // Track which fault keys have already been added to the legend
        const seenKeys = new Set<string>();

        config.regions.forEach(region => {
            // Skip rendering duplicates (e.g., if a fault spans multiple discrete regions)
            if (seenKeys.has(region.key)) return;
            seenKeys.add(region.key);

            const row = document.createElement("div");
            Object.assign(row.style, { display: "flex", alignItems: "center", marginBottom: "6px" });

            const svgContainer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svgContainer.setAttribute("width", "16");
            svgContainer.setAttribute("height", "16");
            Object.assign(svgContainer.style, { marginRight: "8px", overflow: "visible" });

            const regionColor = segmentColors[region.key] || region.defaultColor;

            const iconGroup = d3.select(svgContainer).append("g");
            drawShape(iconGroup, "square", 8, 8, regionColor, 6);

            const textProp = textCardSettings ? textCardSettings[`${region.key}_text`] : null;
            const customText = textProp ? textProp.value : region.label;

            const label = document.createElement("span");
            label.innerText = customText;

            row.append(svgContainer, label);
            this.container.appendChild(row);
        });
    }
}