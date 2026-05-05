import * as d3 from "d3";
import { Point, MathFacade, getDistance } from "../utils/geometry";
import { ParsedDataPoint } from "../utils/dataParser";
import { normalizeData } from "../utils/normalizer";
import { classifyFault } from "../utils/classifier";
import { GasRecord, AxisConfig, PentagonConfig, GLOBAL_CONFIG } from "../config";
import { drawShape } from "../utils/shapes";

export interface ITooltipHandler {
    show(dp: ParsedDataPoint, normalized: GasRecord, fault: string, axes: AxisConfig[], event: MouseEvent): void;
    move(event: MouseEvent): void;
    hide(event: MouseEvent): void;
}

export class PlotRenderer {
    static drawPlots(
        layer: d3.Selection<SVGGElement, unknown, null, undefined>,
        dataPoints: ParsedDataPoint[],
        basePolygon: Point[],
        scaleFactor: number,
        pathSettings: { show: boolean, color: string, thickness: number },
        pointSettings: { latestColor: string, latestSize: number, otherColor: string, otherSize: number },
        config: PentagonConfig,
        pentagonId: string,
        tooltipHandler: ITooltipHandler
    ): void {
        const pathLayer = layer.append("g");
        const markerLayer = layer.append("g");

        let previousPoint: Point | null = null;

        dataPoints.forEach((dp, index) => {
            const isLatest = index === dataPoints.length - 1;
            const normalized = normalizeData(dp.values);
            const unscaledCoord = MathFacade.getCartesianCoordinate(normalized, basePolygon, config.axes);
            
            const fault = classifyFault(pentagonId, unscaledCoord);

            const coord = { x: unscaledCoord.x * scaleFactor, y: unscaledCoord.y * scaleFactor };

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
                .attr("transform", `translate(${coord.x}, ${coord.y}) scale(1, -1) translate(${-coord.x}, ${-coord.y})`);

            pointGroup.append("circle")
                .attr("cx", coord.x).attr("cy", coord.y)
                .attr("r", 3)
                .attr("fill", "none")
                .attr("pointer-events", "all");

            drawShape(pointGroup, shapeType, coord.x, coord.y, shapeColor, shapeSize);

            pointGroup.on("mouseover", (event: MouseEvent) => {
                const el = event.currentTarget as SVGGElement;
                d3.select(el).raise().transition().duration(150).style("filter", "brightness(1.6)");
                tooltipHandler.show(dp, normalized, fault as string, config.axes, event);
            })
            .on("mousemove", (event: MouseEvent) => {
                tooltipHandler.move(event);
            })
            .on("mouseout", (event: MouseEvent) => {
                const el = event.currentTarget as SVGGElement;
                d3.select(el).transition().duration(150).style("filter", null);
                tooltipHandler.hide(event);
            });
        });
    }
}