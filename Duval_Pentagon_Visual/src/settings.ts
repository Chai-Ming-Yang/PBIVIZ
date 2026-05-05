"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import { FAULT_COLORS } from "./utils/faultSpecifications";
import FormattingSettingsCard = formattingSettings.Card;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

class LegendTextCard extends FormattingSettingsCard {
    name: string = "legendText";
    displayName: string = "Legend";

    show = new formattingSettings.ToggleSwitch({ name: "show", displayName: "Show Legend", value: true, topLevelToggle: true });
    
    PD_text = new formattingSettings.TextInput({ name: "PD_text", displayName: "PD Label", value: "PD - Partial Discharge", placeholder: "e.g., PD - Partial Discharge" });
    D1_text = new formattingSettings.TextInput({ name: "D1_text", displayName: "D1 Label", value: "D1 - Discharge of Low Energy", placeholder: "e.g., D1 - Discharge of Low Energy" });
    D2_text = new formattingSettings.TextInput({ name: "D2_text", displayName: "D2 Label", value: "D2 - Discharge of High Energy", placeholder: "e.g., D2 - Discharge of High Energy" });
    T1_text = new formattingSettings.TextInput({ name: "T1_text", displayName: "T1 Label", value: "T1 - Thermal Fault, t < 300°C", placeholder: "e.g., T1 - Thermal Fault" });
    T2_text = new formattingSettings.TextInput({ name: "T2_text", displayName: "T2 Label", value: "T2 - Thermal Fault, 300°C < t < 700°C", placeholder: "e.g., T2 - Thermal Fault" });
    T3_text = new formattingSettings.TextInput({ name: "T3_text", displayName: "T3 Label", value: "T3 - Thermal Fault, t > 700°C", placeholder: "e.g., T3 - Thermal Fault" });
    "T3-H_text" = new formattingSettings.TextInput({ name: "T3-H_text", displayName: "T3-H Label", value: "T3-H - Thermal Fault in Oil Only", placeholder: "e.g., T3-H - Thermal Fault" });
    C_text = new formattingSettings.TextInput({ name: "C_text", displayName: "C Label", value: "C - Carbonization", placeholder: "e.g., C - Carbonization" });
    O_text = new formattingSettings.TextInput({ name: "O_text", displayName: "O Label", value: "O - Overheating", placeholder: "e.g., O - Overheating" });
    S_text = new formattingSettings.TextInput({ name: "S_text", displayName: "S Label", value: "S - Stray Gassing", placeholder: "e.g., S - Stray Gassing" });

    slices: Array<FormattingSettingsSlice> = [this.show, this.PD_text, this.D1_text, this.D2_text, this.T1_text, this.T2_text, this.T3_text, this["T3-H_text"], this.C_text, this.O_text, this.S_text];
}

class SegmentsCard extends FormattingSettingsCard {
    transparency = new formattingSettings.NumUpDown({ name: "transparency", displayName: "Transparency (%)", value: 30 });
    PD = new formattingSettings.ColorPicker({ name: "PD", displayName: "PD Color", value: { value: FAULT_COLORS.PD } });
    T1 = new formattingSettings.ColorPicker({ name: "T1", displayName: "T1 Color", value: { value: FAULT_COLORS.T1 } });
    T2 = new formattingSettings.ColorPicker({ name: "T2", displayName: "T2 Color", value: { value: FAULT_COLORS.T2 } });
    T3 = new formattingSettings.ColorPicker({ name: "T3", displayName: "T3 Color", value: { value: FAULT_COLORS.T3 } });
    "T3-H" = new formattingSettings.ColorPicker({ name: "T3-H", displayName: "T3-H Color", value: { value: FAULT_COLORS["T3-H"] }});
    D1 = new formattingSettings.ColorPicker({ name: "D1", displayName: "D1 Color", value: { value: FAULT_COLORS.D1 } });
    D2 = new formattingSettings.ColorPicker({ name: "D2", displayName: "D2 Color", value: { value: FAULT_COLORS.D2 } });
    
    S = new formattingSettings.ColorPicker({ name: "S", displayName: "S Color", value: { value: FAULT_COLORS.S } });
    O = new formattingSettings.ColorPicker({ name: "O", displayName: "O Color", value: { value: FAULT_COLORS.O } });
    C = new formattingSettings.ColorPicker({ name: "C", displayName: "C Color", value: { value: FAULT_COLORS.C } });
    
    name: string = "regionColors";
    displayName: string = "Segments";
    slices: Array<FormattingSettingsSlice> = [this.transparency, this.PD, this.D1, this.D2, this.T1, this.T2, this.T3, this["T3-H"], this.C, this.O, this.S];
}

class ConnectorCard extends FormattingSettingsCard {
    name: string = "pathSettings";
    displayName: string = "Connector";

    show = new formattingSettings.ToggleSwitch({ name: "show", displayName: "Show Connector", value: true, topLevelToggle: true });

    color = new formattingSettings.ColorPicker({ name: "color", displayName: "Line Color", value: { value: "#555555" } });
    thickness = new formattingSettings.NumUpDown({ name: "thickness", displayName: "Line Thickness (px)", value: 1.5 });

    slices: Array<FormattingSettingsSlice> = [this.show, this.color, this.thickness];
}

class PointSettingsCard extends FormattingSettingsCard {
    latestColor = new formattingSettings.ColorPicker({ name: "latestColor", displayName: "Latest Point Color", value: { value: "#CC0000" } });
    latestSize = new formattingSettings.NumUpDown({ name: "latestSize", displayName: "Latest Point Size (px)", value: 8 });
    
    otherColor = new formattingSettings.ColorPicker({ name: "otherColor", displayName: "Other Points Color", value: { value: "#666666" } });
    otherSize = new formattingSettings.NumUpDown({ name: "otherSize", displayName: "Other Points Size (px)", value: 5 });

    name: string = "pointSettings";
    displayName: string = "Data Points";
    slices: Array<FormattingSettingsSlice> = [this.latestColor, this.latestSize, this.otherColor, this.otherSize];
}

export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    legendTextCard = new LegendTextCard();
    segmentsCard = new SegmentsCard();
    connectorCard = new ConnectorCard();
    pointSettingsCard = new PointSettingsCard();

    cards = [this.legendTextCard, this.segmentsCard, this.connectorCard, this.pointSettingsCard];
}