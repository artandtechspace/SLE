import { OpenObject, Range } from "../../types/Types.js";
import { Element, ElementBuilderBase } from "./fields/BaseElement.js";
import { InfoIconElement } from "./fields/InfoIconElement.js";
import { LineSeperatorElement } from "./fields/LineSeperatorElement.js";
import { NumericFieldBuilder, NumericFieldElement, NumericFieldSettings } from "./fields/NumericElement.js";
import { TextElement } from "./fields/TextElement.js";
import { SettingsUI } from "./SettingsUI.js";

// Line-type
type Line = (Element|ElementBuilderBase<any>)[];

export class SettingsUIBuilder{
    // List with all element that got added already
    private lines: Line[] = [];
    private currentLine: Line = [];

    // Change-callback handler
    private changeCb: ()=>void;

    constructor(changeCb: ()=>void){
        this.changeCb=changeCb;
    }

    // Adds a text-element to the ui
    addText(text: string) : SettingsUIBuilder{
        this.currentLine.push(new TextElement(text));
        return this;
    }

    // Adds a small seperating line with some space below
    addLineSeperator(percLen: number = 60){
        this.currentLine.push(new LineSeperatorElement(percLen));
        return this;
    }

    addInfoIcon(infoText: string){
        this.currentLine.push(new InfoIconElement(infoText));
        return this;
    }

    // Adds a numeric field element to the ui
    addNumericField(key: string, value: number){
        var builder = new NumericFieldBuilder(this,key,value);
        this.currentLine.push(builder);
        return builder;
    }

    breakLine(){
        // Moves all elements to the next line
        this.lines.push(this.currentLine);
        this.currentLine = [];
        return this;
    }

    // Generates and builds the finished-ui, then appends it to the supplied block.
    buildTo(block: any){

        // Ensures all elements have a line
        if(this.currentLine.length > 0)
            this.breakLine();

        // Resolves all left over builders
        var resolvedLines = this.lines.map(line=>{
            return line.map(elmnt=>(elmnt instanceof ElementBuilderBase) ? elmnt.__getBuild() : elmnt)
        })

        // Appends the change-cb to every element and executes the init-event
        resolvedLines.forEach(line=>line.forEach(elm=>elm.init(this.changeCb.bind(this))));
        // Creates the ui and appends it to the block
        var setui = block.settingsui = new SettingsUI(resolvedLines);

        // Appends the setting-ui to be serialized by the blockly-serializsation
        block.saveExtraState = ()=>setui.serialize;
        block.loadExtraState = (obj: OpenObject)=>setui.deserialize(obj);
    }
}