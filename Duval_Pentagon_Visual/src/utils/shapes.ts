import * as d3 from "d3";

/**
 * Pure rendering function for generic shapes.
 */
export function drawShape(
    group: d3.Selection<SVGGElement, unknown, null, undefined>,
    shape: string,
    x: number,
    y: number,
    color: string,
    size: number = 6
): void {
    switch (shape) {
        case "circle":
            group.append("circle")
                .attr("cx", x)
                .attr("cy", y)
                .attr("r", size)
                .attr("fill", color)
                .attr("stroke", "black");
            break;

        case "triangle":
            group.append("path")
                .attr("d", `M ${x} ${y - size} L ${x - size} ${y + size} L ${x + size} ${y + size} Z`)
                .attr("fill", color)
                .attr("stroke", "black");
            break;

        case "square":
            group.append("rect")
                .attr("x", x - size)
                .attr("y", y - size)
                .attr("width", size * 2)
                .attr("height", size * 2)
                .attr("fill", color)
                .attr("stroke", "black");
            break;

        case "diamond":
            group.append("path")
                .attr("d", `M ${x} ${y - size} L ${x - size} ${y} L ${x} ${y + size} L ${x + size} ${y} Z`)
                .attr("fill", color)
                .attr("stroke", "black");
            break;

        case "cross":
            group.append("line")
                .attr("x1", x - size)
                .attr("y1", y)
                .attr("x2", x + size)
                .attr("y2", y)
                .attr("stroke", color)
                .attr("stroke-width", 2);

            group.append("line")
                .attr("x1", x)
                .attr("y1", y - size)
                .attr("x2", x)
                .attr("y2", y + size)
                .attr("stroke", color)
                .attr("stroke-width", 2);
            break;

        case "yshape":
            group.append("line")
                .attr("x1", x)
                .attr("y1", y)
                .attr("x2", x)
                .attr("y2", y - size)
                .attr("stroke", color)
                .attr("stroke-width", 2);

            group.append("line")
                .attr("x1", x)
                .attr("y1", y)
                .attr("x2", x - size)
                .attr("y2", y + size)
                .attr("stroke", color)
                .attr("stroke-width", 2);

            group.append("line")
                .attr("x1", x)
                .attr("y1", y)
                .attr("x2", x + size)
                .attr("y2", y + size)
                .attr("stroke", color)
                .attr("stroke-width", 2);
            break;
    }
}