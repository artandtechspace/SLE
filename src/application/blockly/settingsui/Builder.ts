import { Element } from "./fields/BaseElement.js";
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
        return this;
    }

    // Adds a small seperating line with some space below
    addLineSeperator(){
        this.elements.push(new LineSeperatorElement());
        return this;
    }

    // Adds a numeric field element to the ui
    addNumericField(key: string, displayString: string, value: number, settings: NumericFieldSettings) : SettingsUIBuilder{
        this.elements.push(new NumericFieldElement(key,value,displayString,settings));
        return this;
    }

    // Generates and builds the finished-ui. The finished ui is returned
    build(){
        // Appends the change-cb to every element and executes the init-event
        this.elements.forEach(elm=>elm.init(this.changeCb));


        return new SettingsUI(this.elements);
    }
}