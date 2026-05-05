"use strict";

import powerbi from "powerbi-visuals-api";
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;

import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { VisualFormattingSettingsModel } from "./settings";

import { GLOBAL_CONFIG, PENTAGON_CONFIGS, PentagonConfig, GasRecord, AxisConfig } from "./config";
import { Point } from "./utils/geometry";
import { parseData, ParsedDataPoint } from "./utils/dataParser";
import { PlotRenderer } from "./renderers/PlotRenderer";

import { UIController } from "./controllers/UIController";
import { ViewportController } from "./controllers/ViewportController";
import { GeometryRenderer } from "./renderers/GeometryRenderer";
import { LegendRenderer } from "./renderers/LegendRenderer";

interface RenderSettings {
    showLegend: boolean;
    regionTransparency: number;
    path: { show: boolean; color: string; thickness: number };
    point: { latestColor: string; latestSize: number; otherColor: string; otherSize: number };
}

export class Visual implements IVisual {
    private uiController: UIController;
    private viewportController: ViewportController;
    private legendRenderer: LegendRenderer;
    
    private formattingSettings!: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;
    private lastUpdateOptions!: VisualUpdateOptions;

    constructor(options: VisualConstructorOptions) {
        options.element.style.position = "relative";

        this.formattingSettingsService = new FormattingSettingsService();
        this.formattingSettings = new VisualFormattingSettingsModel();

        // 1. Dependency Injection: Orchestrating the Controllers
        this.uiController = new UIController(options.element, GLOBAL_CONFIG.zoom);
        this.viewportController = new ViewportController(options.element, this.uiController);
        this.legendRenderer = new LegendRenderer(options.element);

        // 2. State Binding: Ensure view reacts to UI controller changes cleanly
        this.uiController.onStateChange((state) => {
            this.viewportController.applyTransform(state);
            if (this.lastUpdateOptions) {
                this.update(this.lastUpdateOptions);
            }
        });
    }

    public update(options: VisualUpdateOptions): void {
        this.lastUpdateOptions = options;
        this.viewportController.updateDimensions(options.viewport.width, options.viewport.height);

        const dataView = options.dataViews?.[0];
        const objects = dataView?.metadata?.objects;

        if (dataView) {
            this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(VisualFormattingSettingsModel, options.dataViews);
        }

        const uiState = this.uiController.getState();
        const activeConfig: PentagonConfig = PENTAGON_CONFIGS[uiState.activeShape] || PENTAGON_CONFIGS["P1"];

        if (!this.validateDataMapping(dataView, activeConfig)) {
            return; 
        }

        const settings = this.extractRenderSettings(objects);
        this.legendRenderer.toggle(settings.showLegend);

        this.renderScene(dataView, activeConfig, settings);
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }

    private validateDataMapping(dataView: powerbi.DataView | undefined, config: PentagonConfig): boolean {
        let missingGases: string[] = [];
        
        if (dataView?.table?.columns) {
            missingGases = config.axes
                .filter(axis => !dataView.table!.columns.some(c => c.roles && c.roles[axis.key]))
                .map(a => a.label.replace(/[^A-Za-z0-9₂₄₆]/g, '').trim()); 
        } else {
            missingGases = config.axes.map(a => a.label.replace(/[^A-Za-z0-9₂₄₆]/g, '').trim());
        }

        if (missingGases.length > 0) {
            const activeShape = this.uiController.getState().activeShape;
            this.uiController.showWarning(`Missing Required Data\n\nPlease map the following columns to view ${activeShape}:\n${missingGases.join(", ")}`);
            this.viewportController.clearTransientLayers();
            this.legendRenderer.toggle(false);
            return false; 
        }
        
        this.uiController.hideWarning();
        return true;
    }

    private extractRenderSettings(objects: any): RenderSettings {
        return {
            showLegend: this.getSettingsValue<boolean>(objects, "legendText", "show", true),
            regionTransparency: this.getSettingsValue<number>(objects, "regionColors", "transparency", 30),
            path: {
                show: this.getSettingsValue<boolean>(objects, "pathSettings", "show", true),
                color: this.getSettingsValue<string>(objects, "pathSettings", "color", "#555555"),
                thickness: this.getSettingsValue<number>(objects, "pathSettings", "thickness", 1.5)
            },
            point: {
                latestColor: this.getSettingsValue<string>(objects, "pointSettings", "latestColor", "#CC0000"),
                latestSize: this.getSettingsValue<number>(objects, "pointSettings", "latestSize", 8),
                otherColor: this.getSettingsValue<string>(objects, "pointSettings", "otherColor", "#666666"),
                otherSize: this.getSettingsValue<number>(objects, "pointSettings", "otherSize", 5)
            }
        };
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

    private renderScene(dataView: powerbi.DataView | undefined, config: PentagonConfig, settings: RenderSettings): void {
        const size = Math.min(this.viewportController.width, this.viewportController.height) * 0.4;
        
        const basePolygon: Point[] = [
            { x: 0, y: 40 }, { x: 38, y: 12 }, { x: 23.5, y: -32.4 }, { x: -23.5, y: -32.4 }, { x: -38, y: 12.4 }      
        ];
        
        const scaleFactor = size / 40;
        const renderPolygon: Point[] = basePolygon.map(v => ({ x: v.x * scaleFactor, y: v.y * scaleFactor }));

        const layers = this.viewportController.prepareLayers(settings.path);

        const segmentColors: Record<string, string> = {};
        const colorsCard = this.formattingSettings.segmentsCard as any;
        config.regions.forEach(r => {
            segmentColors[r.key] = colorsCard && colorsCard[r.key] ? colorsCard[r.key].value.value : r.defaultColor;
        });

        // Extract active UI Shape (Pentagon ID)
        const activeShape = this.uiController.getState().activeShape;

        // 3. Delegation: Passing data to pure UI/Renderer units
        this.legendRenderer.render(config, segmentColors, this.formattingSettings.legendTextCard);

        GeometryRenderer.drawRegions(layers.regionsLayer, scaleFactor, settings.regionTransparency, config, segmentColors, activeShape);
        GeometryRenderer.drawPolygonOutline(layers.outlineLayer, renderPolygon);
        GeometryRenderer.drawAxes(layers.axesLayer, renderPolygon, config);
        GeometryRenderer.drawRegionLabels(layers.labelsLayer, scaleFactor, config, activeShape);

        if (dataView) {
            const parsed = parseData(dataView, config.axes);
            
            const tooltipHandler = {
                show: (dp: ParsedDataPoint, normalized: GasRecord, fault: string, axes: AxisConfig[], event: MouseEvent) => {
                    this.uiController.showTooltip(dp, normalized, fault, axes, event, this.viewportController.width, this.viewportController.height);
                },
                move: (event: MouseEvent) => {
                    this.uiController.moveTooltip(event, this.viewportController.width, this.viewportController.height);
                },
                hide: (event: MouseEvent) => {
                    this.uiController.hideTooltip();
                }
            };

            PlotRenderer.drawPlots(
                layers.plotsLayer, 
                parsed, 
                basePolygon, 
                scaleFactor, 
                settings.path, 
                settings.point, 
                config, 
                activeShape,
                tooltipHandler
            );
        }

        this.viewportController.applyTransform(this.uiController.getState());
    }
}