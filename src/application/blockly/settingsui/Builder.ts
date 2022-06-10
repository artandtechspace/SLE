import { Range } from "../../types/Types.js";
import { Element } from "./fields/BaseElement.js";
import { ForceLineBreakElement } from "./fields/ForceLineBreakElement.js";
import { InfoIconElement } from "./fields/InfoIconElement.js";
import { LineSeperatorElement } from "./fields/LineSeperatorElement.js";
import { NumericFieldElement, NumericFieldSettings } from "./fields/NumericElement.js";
import { TextElement } from "./fields/TextElement.js";
import { SettingsUI } from "./SettingsUI.js";

export class SettingsUIBuilder{
    // List with all element that got added already
    private elements: Element[] = [];

    // Change-callback handler
    private changeCb: ()=>void;

    constructor(changeCb: ()=>void){
        this.changeCb=changeCb;
    }

    // Adds a text-element to the ui
    addText(text: string) : SettingsUIBuilder{
        this.elements.push(new TextElement(text));
        this.elements.push(new ForceLineBreakElement());
        return this;
    }

    // Adds a small seperating line with some space below
    addLineSeperator(percLen: number = 60){
        this.elements.push(new LineSeperatorElement(percLen));
        return this;
    }

    // Adds a numeric field element to the ui
    addNumericField(key: string, displayString: string, value: number, settings: NumericFieldSettings) : SettingsUIBuilder{
        this.elements.push(new NumericFieldElement(key,value,displayString,settings));
        this.elements.push(new ForceLineBreakElement());
        return this;
    }

    // Adds a numeric field element to the ui
    addNumericFieldWithInfo(key: string, displayString: string, value: number, settings: NumericFieldSettings, infoText: string) : SettingsUIBuilder{
        this.elements.push(new NumericFieldElement(key,value,displayString,settings));
        this.elements.push(new InfoIconElement(infoText));
        this.elements.push(new ForceLineBreakElement());
        return this;
    }

    // Generates and builds the finished-ui. The finished ui is returned
    build(){
        // Appends the change-cb to every element and executes the init-event
        this.elements.forEach(elm=>elm.init(this.changeCb));
        return new SettingsUI(this.elements);
    }
}