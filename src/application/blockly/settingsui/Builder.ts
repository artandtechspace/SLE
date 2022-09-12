import { HSV, OpenObject, PercentageNumber } from "../../types/Types.js";
import { Element, ElementBuilderBase } from "./fields/BaseElement.js";
import { BrightnessPickerElement } from "./fields/BrightnessPickerElement.js";
import { DropDownElement } from "./fields/DropDownElement.js";
import { ColorPickerElement } from "./fields/ColorPickerElement.js";
import { InfoIconElement } from "./fields/InfoIconElement.js";
import { LineSeperatorElement } from "./fields/LineSeperatorElement.js";
import { NumericFieldBuilder } from "./fields/NumericElement.js";
import { TextElement } from "./fields/TextElement.js";
import { Manager, SettingsUI } from "./SettingsUI.js";
import { Language } from "../../language/LanguageManager.js";

// Line-type
type Line = (Element|ElementBuilderBase<any>)[];

export class SettingsUIBuilder<PreviousElement>{
    // List with all element that got added already
    private lines: Line[] = [];
    private currentLine: Line = [];

    // Link to get the callchain back to the original builder
    private buildBackTo: (x: (block: any)=>void) => PreviousElement;

    // Namespace to put before every language lookup
    private languageNameSpace: string

    constructor(buildBackTo: (x: (block: any)=>void) => PreviousElement, languageNameSpace: string){
        this.buildBackTo = buildBackTo;
        this.languageNameSpace = languageNameSpace;
    }

    // Adds a text-element to the ui
    addText(text: string){
        // TODO
    //    this.currentLine.push(new TextElement(text));
        return this;
    }

    // TODO: Lang
    /**
     * Adds a small dropdown to select values from
     * 
     * @param key the key that can be used inside the module-generator
     * @param values array with keys that can be selected
     * @param subNameSpace the general subname-space for the dropdown
     * @param selectIndex (Optionally) a different selected index
     * 
     * the actual language lookup later is like this:
     * {this.languageNameSpace}{subNameSpace}.{selected key}
     */
    addDropdown(key: string, subNameSpace: string, values: string[], selectIndex: number = 0){
        this.currentLine.push(new DropDownElement(key, this.languageNameSpace+subNameSpace+".", values, selectIndex));
        return this;
    }

    // Adds a small seperating line with some space below
    addLineSeperator(percLen: number = 60){
        this.currentLine.push(new LineSeperatorElement(percLen));
        return this;
    }

    // Adds a small i-icon that shaws the given info-text when hovering over it
    addInfoIcon(infoText: string){
        this.currentLine.push(new InfoIconElement(this.languageNameSpace+infoText));
        return this;
    }

    // Adds a numeric field element to the ui
    addNumericField(key: string, value: string|number){
        var builder = new NumericFieldBuilder(this,key,value.toString());
        this.currentLine.push(builder);
        return builder;
    }

    // Adds a color field element to the ui
    addColorField(key: string, value?: HSV){
        this.currentLine.push(new ColorPickerElement(key, value));
        return this;
    }

    // Adds a brightness-field element to the ui
    addBrightnessField(key: string, value?: PercentageNumber){
        this.currentLine.push(new BrightnessPickerElement(key, value));
        return this;
    }

    // Breaks the line to add elements to the next one
    breakLine(langKey: string|undefined){

        // Performs the language-lookup and segmentation (One segment more than fields to have one before and after every field)
        var segment = Language.getSegmented(this.languageNameSpace+langKey, this.currentLine.length + 1);

        // Holds the build line
        var build = [];

        // Iterates over every segment
        for(var i = 0; i < segment.length; i++){
            // Gets the text-segment
            var txt = segment[i];

            // Writes the segment before the next field
            if(txt.trim().length > 0)
                build.push(new TextElement(txt));

            // Appends the next field (if it is not one over)
            if(i < this.currentLine.length)
                build.push(this.currentLine[i]);
        }

        // Moves all elements to the next line
        this.lines.push(build);
        this.currentLine = [];
        return this;
    }

    // Event: When the gui shall be generated
    private onGenerate(block: any, changeEvtHandler: ()=>void){
        // Resolves all left over builders
        var resolvedLines = this.lines.map(line=>{
            return line.map(elmnt=>(elmnt instanceof ElementBuilderBase) ? elmnt.__getBuild() : elmnt)
        })

        // Appends the change-cb to every element and executes the init-event
        resolvedLines.forEach(line=>line.forEach(elm=>elm.init(changeEvtHandler.bind(this))));
        // Creates the ui and appends it to the block
        var setui = block.settingsui = new SettingsUI(resolvedLines);

        // Appends the setting-ui to be serialized by the blockly-serializsation
        block.saveExtraState = ()=>setui.serialize();
        // If the setui.deserialize-function throws an error, it will be catched by the general
        // deserialize-logic inside the ErrorSystem.importFromString with the blockly-serializsation logic
        block.loadExtraState = (obj: OpenObject)=>setui.deserialize(obj);
    }

    // Generates and builds the finished-ui, then appends it to the supplied block.
    endCustomUi(){
        // Gets the generator-callback
        const handler = this.onGenerate.bind(this);

        // Redirects the callchain back to the original element and also passes on the function to generate the sub-ui on the block
        return this.buildBackTo((block: any)=>handler(block, Manager.getChangeCallback()));
    }
}