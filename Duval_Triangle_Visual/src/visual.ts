"use strict";

import powerbi from "powerbi-visuals-api";
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;

import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { VisualFormattingSettingsModel } from "./settings";

import { GLOBAL_CONFIG, TRIANGLE_CONFIGS, TriangleConfig, FAULT_COLORS } from "./config";
import { createRegularPolygon } from "./utils/geometry";
import { FaultSpecificationFactory } from "./utils/faultSpecifications";
import { parseData } from "./utils/dataParser";

import { UIController } from "./controllers/UIController";
import { ViewportController } from "./controllers/ViewportController";
import { GeometryRenderer } from "./renderers/GeometryRenderer";
import { PlotRenderer, ITooltipHandler } from "./renderers/PlotRenderer";
import { LegendRenderer } from "./renderers/LegendRenderer";

export class Visual implements IVisual {
    private uiController: UIController;
    private viewportController: ViewportController;
    
    private formattingSettings!: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;
    private lastUpdateOptions!: VisualUpdateOptions;

    constructor(options: VisualConstructorOptions) {
        const root = options.element;
        root.style.position = "relative";

        this.formattingSettingsService = new FormattingSettingsService();
        this.formattingSettings = new VisualFormattingSettingsModel();

        this.uiController = new UIController(root, GLOBAL_CONFIG.zoom);
        this.viewportController = new ViewportController(root, this.uiController);
        
        // Mediator routing: UI State -> Viewport Adjustments -> Re-Render
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

        if (dataView) {
            this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(VisualFormattingSettingsModel, options.dataViews);
        }

        const currentState = this.uiController.getState();
        const activeConfig: TriangleConfig = TRIANGLE_CONFIGS[currentState.activeTriangle] || TRIANGLE_CONFIGS["1"];

        let missingGases: string[] = [];
        if (dataView?.table?.columns) {
            missingGases = activeConfig.axes
                .filter(axis => !dataView!.table!.columns.some(c => c.roles && c.roles[axis.key]))
                .map(a => a.label.replace(/[^A-Za-z0-9₂₄₆]/g, '').trim()); 
        } else {
            missingGases = activeConfig.axes.map(a => a.label.replace(/[^A-Za-z0-9₂₄₆]/g, '').trim());
        }

        const showLegendState = this.formattingSettings.legendTextCard.show.value;

        if (missingGases.length > 0) {
            this.uiController.showWarning(`Missing Required Data\n\nPlease map the following columns to view DT${currentState.activeTriangle}:\n${missingGases.join(", ")}`);
            this.viewportController.clearTransientLayers();
            this.uiController.toggleLegend(false);
            return; 
        } else {
            this.uiController.hideWarning();
            this.uiController.toggleLegend(showLegendState);
        }

        const regionSettings = { transparency: this.formattingSettings.segmentsCard.transparency.value };
        const pathSettings = {
            show: this.formattingSettings.connectorCard.show.value,
            color: this.formattingSettings.connectorCard.color.value.value,
            thickness: this.formattingSettings.connectorCard.thickness.value,
            declutterThreshold: GLOBAL_CONFIG.declutterThreshold
        };
        const pointSettings = {
            latestColor: this.formattingSettings.pointSettingsCard.latestColor.value.value,
            latestSize: this.formattingSettings.pointSettingsCard.latestSize.value,
            otherColor: this.formattingSettings.pointSettingsCard.otherColor.value.value,
            otherSize: this.formattingSettings.pointSettingsCard.otherSize.value
        };

        const size = Math.min(options.viewport.width, options.viewport.height) * 0.4;
        const polygon = createRegularPolygon(activeConfig.axes.length, size);

        // Fetch freshly clean SVG layer selections from the controller
        const layers = this.viewportController.prepareLayers(pathSettings);

        // Render Legend (UI Layer)
        LegendRenderer.render(this.uiController.legendContainer, activeConfig, this.formattingSettings.legendTextCard, this.formattingSettings.segmentsCard);

        const segmentColors: Record<string, string> = {};
        const colorsCard = this.formattingSettings.segmentsCard as any;
        activeConfig.regions.forEach(regionKey => {
            const prop = colorsCard[regionKey];
            segmentColors[regionKey] = prop ? prop.value.value : FAULT_COLORS[regionKey as keyof typeof FAULT_COLORS];
        });

        const specifications = FaultSpecificationFactory.getSpecificationsForTriangle(currentState.activeTriangle);

        // Pipeline: Render Static Geometry (SVG Layer)
        GeometryRenderer.drawRegions(layers.regionsLayer, polygon, regionSettings.transparency, activeConfig, segmentColors, specifications);
        GeometryRenderer.drawOutline(layers.outlineLayer, polygon);
        GeometryRenderer.drawAxes(layers.axesLayer, polygon, activeConfig);
        GeometryRenderer.drawRegionLabels(layers.labelsLayer, polygon, activeConfig);
        GeometryRenderer.drawPrerequisiteMessage(layers.labelsLayer, currentState.activeTriangle, size);

        // Pipeline: Render Dynamic Data (SVG Layer)
        if (dataView) {
            const parsed = parseData(dataView, activeConfig.axes);
            
            // Decoupled Tooltip Adapter
            const tooltipAdapter: ITooltipHandler = {
                show: (dp, normalized, fault, axes, event) => this.uiController.showTooltip(dp, normalized, fault, axes, event, options.viewport.width, options.viewport.height),
                move: (event) => this.uiController.moveTooltip(event, options.viewport.width, options.viewport.height),
                hide: () => this.uiController.hideTooltip()
            };

            PlotRenderer.drawPlots(layers.plotsLayer, parsed, polygon, pathSettings as any, pointSettings as any, activeConfig, specifications, tooltipAdapter);
        }

        // Finalize state constraints
        this.viewportController.applyTransform(currentState);
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        try {
            return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
        } catch (error) {
            console.error("🚨 FORMATTING MODEL CRASH 🚨:", error);
            throw error;
        }
    }
}