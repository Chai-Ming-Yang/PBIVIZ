import * as d3 from "d3";
import { TriangleConfig, FAULT_COLORS } from "../config";
import { drawShape } from "../utils/shapes";

export class LegendRenderer {
    static render(container: HTMLDivElement, config: TriangleConfig, textCard: any, colorsCard: any): void {
        container.replaceChildren();
        const seenKeys = new Set<string>();

        config.regions.forEach(regionKey => {
            if (seenKeys.has(regionKey)) return;
            seenKeys.add(regionKey);

            const row = document.createElement("div");
            Object.assign(row.style, { display: "flex", alignItems: "center", marginBottom: "6px" });

            const svgContainer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svgContainer.setAttribute("width", "16");
            svgContainer.setAttribute("height", "16");
            Object.assign(svgContainer.style, { marginRight: "8px", overflow: "visible" });

            const colorProp = colorsCard[regionKey];
            const regionColor = colorProp ? colorProp.value.value : FAULT_COLORS[regionKey as keyof typeof FAULT_COLORS];

            const iconGroup = d3.select(svgContainer).append("g");
            drawShape(iconGroup, "square", 8, 8, regionColor, 6);

            const textProp = textCard[`${regionKey}_text`];
            const customText = textProp ? textProp.value : regionKey;

            const label = document.createElement("span");
            label.innerText = customText;

            row.append(svgContainer, label);
            container.appendChild(row);
        });
    }
}