import { ParsedDataPoint } from "../utils/dataParser";
import { GasRecord, AxisConfig } from "../config";

export interface UIState {
    activeTriangle: string;
    zoomLevel: number;
}

export class UIController {
    private uiLayer: HTMLDivElement;
    public legendContainer: HTMLDivElement;
    private tooltip: HTMLDivElement;
    private zoomSlider: HTMLInputElement;
    private toggleContainer: HTMLDivElement;
    public warningText: HTMLDivElement;

    private state: UIState;
    private onStateChangeCallback: ((state: UIState) => void) | null = null;
    private zoomLimits: { min: number, max: number, default: number };

    constructor(private root: HTMLElement, zoomConfig: { min: number, max: number, default: number }) {
        this.zoomLimits = zoomConfig;
        this.state = {
            activeTriangle: "1",
            zoomLevel: zoomConfig.default
        };

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
        this.zoomSlider.min = zoomConfig.min.toString();
        this.zoomSlider.max = zoomConfig.max.toString();
        this.zoomSlider.step = "0.1";
        this.zoomSlider.value = zoomConfig.default.toString();
        Object.assign(this.zoomSlider.style, {
            position: "absolute", bottom: "10px", left: "50%", transform: "translateX(-50%)",
            pointerEvents: "auto"
        });
        
        this.zoomSlider.addEventListener("input", () => {
            this.state.zoomLevel = parseFloat(this.zoomSlider.value);
            this.notifyStateChange();
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
                background: this.state.activeTriangle === type ? "#0078d4" : "#f4f4f4",
                color: this.state.activeTriangle === type ? "#fff" : "#333",
                fontWeight: "bold", borderRadius: "4px", fontSize: "14px",
                transition: "background 0.2s"
            });
            btn.onclick = () => {
                this.state.activeTriangle = type;
                this.updateToggleButtons();
                this.notifyStateChange();
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

    public onStateChange(callback: (state: UIState) => void): void {
        this.onStateChangeCallback = callback;
    }

    private notifyStateChange(): void {
        if (this.onStateChangeCallback) {
            this.onStateChangeCallback({ ...this.state });
        }
    }

    private updateToggleButtons(): void {
        Array.from(this.toggleContainer.children).forEach((child, i) => {
            const el = child as HTMLElement;
            const t = ["1", "4", "5"][i];
            el.style.background = this.state.activeTriangle === t ? "#0078d4" : "#f4f4f4";
            el.style.color = this.state.activeTriangle === t ? "#fff" : "#333";
        });
    }

    public updateZoomFromScroll(delta: number): void {
        this.state.zoomLevel = Math.min(this.zoomLimits.max, Math.max(this.zoomLimits.min, this.state.zoomLevel + delta));
        this.zoomSlider.value = this.state.zoomLevel.toString();
        this.notifyStateChange();
    }

    public getState(): UIState {
        return { ...this.state };
    }

    public showWarning(message: string): void {
        this.warningText.innerText = message;
        this.warningText.style.display = "block";
    }

    public hideWarning(): void {
        this.warningText.style.display = "none";
    }

    public toggleLegend(show: boolean): void {
        this.legendContainer.style.display = show ? "block" : "none";
    }

    public showTooltip(dp: ParsedDataPoint, normalized: GasRecord, fault: string, axes: AxisConfig[], event: MouseEvent, containerWidth: number, containerHeight: number): void {
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

        axes.forEach(axis => {
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
        
        this.moveTooltip(event, containerWidth, containerHeight);
    }

    public moveTooltip(event: MouseEvent, containerWidth: number, containerHeight: number): void {
        const tooltipWidth = this.tooltip.offsetWidth;
        const tooltipHeight = this.tooltip.offsetHeight;

        let leftPos = event.clientX + 15;
        let topPos = event.clientY + 15;

        if (leftPos + tooltipWidth > containerWidth) {
            leftPos = event.clientX - tooltipWidth - 15;
        }

        if (topPos + tooltipHeight > containerHeight) {
            topPos = event.clientY - tooltipHeight - 15;
        }

        this.tooltip.style.left = `${leftPos}px`;
        this.tooltip.style.top = `${topPos}px`;
    }

    public hideTooltip(): void {
        this.tooltip.style.display = "none";
    }
}