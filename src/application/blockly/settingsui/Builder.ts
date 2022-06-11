import { Range } from "../../types/Types.js";
import { Element, ElementBuilderBase } from "./fields/BaseElement.js";
import { ForceLineBreakElement } from "./fields/ForceLineBreakElement.js";
import { InfoIconElement } from "./fields/InfoIconElement.js";
import { LineSeperatorElement } from "./fields/LineSeperatorElement.js";
import { NumericFieldBuilder, NumericFieldElement, NumericFieldSettings } from "./fields/NumericElement.js";
import { TextElement } from "./fields/TextElement.js";
import { SettingsUI } from "./SettingsUI.js";

export class SettingsUIBuilder{
    // List with all element that got added already
    private elements: (Element|ElementBuilderBase<any>)[] = [];

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
    addNumericField(key: string, displayString: string, value: number){
        var builder = new NumericFieldBuilder(this,key,value,displayString);
        this.elements.push(builder);
        return builder;
    }

    // Generates and builds the finished-ui, then appends it to the supplied block.
    buildTo(block: any){
        // Resolves all left over builders
        var resolvedElements = this.elements.map(elm=>{
            return (elm instanceof ElementBuilderBase) ? elm.__getBuild() : elm;
        });

        // Appends the change-cb to every element and executes the init-event
        resolvedElements.forEach(elm=>elm.init(this.changeCb));
        block.settingsui = new SettingsUI(resolvedElements);
    }
}