import * as d3 from "d3";
import { PentagonConfig } from "../config";
import { Point, calculateShoelaceCentroid } from "../utils/geometry";
import { FaultSpecificationFactory } from "../utils/faultSpecifications";

export class GeometryRenderer {
    
    public static drawPolygonOutline(layer: d3.Selection<SVGGElement, unknown, null, undefined>, polygon: Point[]): void {
        // Map points to explicit SVG Move (M) and Line (L) commands, ending with Close (Z)
        const pathData = polygon.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(" ") + " Z";
        
        layer.append("path")
            .attr("d", pathData)
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("stroke-linejoin", "round");
    }

    public static drawRegions(
        layer: d3.Selection<SVGGElement, unknown, null, undefined>, 
        scaleFactor: number, 
        transparency: number, 
        config: PentagonConfig,
        segmentColors: Record<string, string>,
        pentagonId: string
    ): void {
        const opacity = Math.max(0, Math.min(1, 1 - (transparency / 100)));
        const specs = FaultSpecificationFactory.getSpecificationsForPentagon(pentagonId);

        config.regions.forEach(region => {
            const spec = specs.find(s => s.getFaultType() === region.key);
            if (!spec) return;
            
            const vertices = spec.getVertices();
            if (!vertices || vertices.length === 0) return;

            const regionColor = segmentColors[region.key] || region.defaultColor;

            const pointsStr = vertices.map(p => {
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

    public static drawAxes(layer: d3.Selection<SVGGElement, unknown, null, undefined>, polygon: Point[], config: PentagonConfig): void {
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

    public static drawRegionLabels(layer: d3.Selection<SVGGElement, unknown, null, undefined>, scaleFactor: number, config: PentagonConfig, pentagonId: string): void {
        const specs = FaultSpecificationFactory.getSpecificationsForPentagon(pentagonId);

        config.regionLabels.forEach(labelConf => {
            // Find the corresponding region configuration
            const region = config.regions.find(r => r.key === labelConf.key);
            if (!region) return;

            // Match it with the exact mathematical boundaries from the Specification Pattern
            const spec = specs.find(s => s.getFaultType() === region.key);
            if (!spec) return;
            
            const vertices = spec.getVertices();
            if (!vertices || vertices.length === 0) return;

            // Mathematically calculate the unscaled geometric center of the specific fault region
            const unscaledCentroid = calculateShoelaceCentroid(vertices);
            
            // Scale the centroid to the active UI viewport
            const scaledX = unscaledCentroid.x * scaleFactor;
            const scaledY = unscaledCentroid.y * scaleFactor;

            // Apply explicit visual offsets defined in config
            const finalX = scaledX + labelConf.offset.x;
            const finalY = scaledY + labelConf.offset.y;

            // Draw a connecting pointer line if the label is pushed externally
            if (labelConf.isExternal) {
                layer.append("line")
                    .attr("x1", scaledX).attr("y1", scaledY)
                    .attr("x2", finalX).attr("y2", finalY)
                    .attr("stroke", "black")
                    .attr("stroke-width", 1);
            }

            // Create the group and un-flip it for SVG cartesian space
            const labelGroup = layer.append("g")
                .attr("transform", `translate(${finalX}, ${finalY}) scale(1, -1)`);

            // Draw the text first so we can measure its bounding box
            const textNode = labelGroup.append("text")
                .attr("x", 0).attr("y", 1) // Slight Y nudge for vertical centering
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "middle")
                .attr("font-size", "12px")
                .attr("font-weight", "bold")
                .attr("font-family", "sans-serif")
                .text(labelConf.key);

            // Measure the text and draw the background box BEFORE the text
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
}