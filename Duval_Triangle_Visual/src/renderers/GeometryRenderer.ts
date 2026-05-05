import * as d3 from "d3";
import { TriangleConfig } from "../config";
import { Point, barycentricToCartesian, interpolate, getPolygonEdges } from "../utils/geometry";
import { IFaultSpecification } from "../utils/faultSpecifications";

export class GeometryRenderer {
    static drawOutline(layer: d3.Selection<SVGGElement, unknown, null, undefined>, polygon: Point[]): void {
        const pointsStr = polygon.map(p => `${p.x},${p.y}`).join(" ");
        layer.append("polygon")
            .attr("points", pointsStr)
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 2);
    }

    static drawRegions(
        layer: d3.Selection<SVGGElement, unknown, null, undefined>,
        polygon: Point[],
        transparency: number,
        config: TriangleConfig,
        segmentColors: Record<string, string>,
        specifications: IFaultSpecification[]
    ): void {
        const opacity = Math.max(0, Math.min(1, 1 - (transparency / 100)));

        config.regions.forEach(regionKey => {
            const matchingSpecs = specifications.filter(s => s.getFaultType() === regionKey);
            
            matchingSpecs.forEach(spec => {
                const vertices = spec.getVertices();
                if (!vertices || vertices.length === 0) return;

                const regionColor = segmentColors[regionKey];
                
                const pointsStr = vertices.map(gas => {
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
        });
    }

    static drawAxes(layer: d3.Selection<SVGGElement, unknown, null, undefined>, polygon: Point[], config: TriangleConfig): void {
        const edges = getPolygonEdges(polygon);

        edges.forEach((edge, i) => {
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

    static drawRegionLabels(layer: d3.Selection<SVGGElement, unknown, null, undefined>, polygon: Point[], config: TriangleConfig): void {
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

            const textNode = labelGroup.append("text")
                .attr("x", 0).attr("y", 1)
                .attr("text-anchor", "middle").attr("alignment-baseline", "middle")
                .attr("font-size", "9px").attr("font-family", "sans-serif")
                .text(labelConf.key);

            const bbox = (textNode.node() as SVGTextElement).getBBox();
            const paddingX = 6;
            const paddingY = 4;
            const boxWidth = bbox.width + paddingX;
            const boxHeight = bbox.height + paddingY;

            labelGroup.insert("rect", "text")
                .attr("x", -boxWidth / 2).attr("y", -boxHeight / 2)
                .attr("width", boxWidth).attr("height", boxHeight)
                .attr("fill", "white").attr("fill-opacity", 1)
                .attr("stroke", "black")
                .attr("stroke-width", 1).attr("rx", 2);
        });
    }

    static drawPrerequisiteMessage(
        layer: d3.Selection<SVGGElement, unknown, null, undefined>, 
        triangleId: string, 
        radius: number
    ): void {
        if (triangleId !== "4" && triangleId !== "5") return;

        const conciseMessage = triangleId === "4" 
            ? "Prerequisite: PD, T1, or T2 in Triangle 1."
            : "Prerequisite: T2 or T3 in Triangle 1.";

        const yOffset = (-radius * 1.05); 

        layer.append("text")
            .attr("x", 0)
            .attr("y", yOffset)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .attr("fill", "#cc0000")
            .attr("opacity", 0.85)
            .text(conciseMessage);
    }
}