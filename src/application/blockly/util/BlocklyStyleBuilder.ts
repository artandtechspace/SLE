import { Language, LanguageRef } from "../../language/LanguageManager.js";
import { PercentageNumber } from "../../types/Types.js";
import FieldBrightness from "../fields/FieldBrightness.js";
import FieldCustomColor from "../fields/FieldCustomColor.js";
import { SettingsUIBuilder } from "../settingsui/Builder.js";

const Blockly = require("blockly");


// Creates a blockly-style builder instance with the given hue-rotation
export const createBlocklyStyle = (hueRotation: number, languageNameSpace: string)=>new BlocklyStyleBuilder(hueRotation, languageNameSpace);

class BlocklyStyleBuilder{

    // Instructions to execute on the default-field
    private fieldInstructions: any[] = [];
    // Instructions to execute on the block itself
    private blockInstructions: any[] = [];

    // Hue-rotation color of the block
    private hueRotation: number;

    // Namespace to put before every language lookup
    private languageNameSpace: string;

    constructor(hueRotation: number, languageNameSpace: string){
        this.hueRotation = hueRotation;

        this.languageNameSpace = languageNameSpace;
    }

    // Event: Gets used when the callback ends on the custom-ui
    private onUiCompleted(instr: (block:any)=>void){
        this.blockInstructions.push(instr);
        return this;
    }

    withTextfield(key: string, value: string){
        this.fieldInstructions.push((field: any)=>field.appendField(new Blockly.FieldTextInput(value), key));

        return this;
    }

    // Add a brightness field
    withFieldBrightness(key: string, v?:number){
        this.fieldInstructions.push((fld: any)=>{
            fld.appendField(new FieldBrightness(v), key);
        });

        return this;
    }

    // Add a custom-color field
    withFieldCustomColor(key: string, h?: number, s?: number, v?:number){
        this.fieldInstructions.push((fld: any)=>{
            fld.appendField(new FieldCustomColor({h: h as PercentageNumber, s: s as PercentageNumber, v: v as PercentageNumber}), key);
        });

        return this;
    }

    // TODO: Desc
    withField(key: string, field: any){
        this.fieldInstructions.push((fld:any)=>fld.appendField(field, key));

        return this;
    }

    withFieldDropdown(key: string, input: {[key: string]: string}){
        // Brings the drop-down values into the correct format and also directly resolves the language lookups
        var dropvalues = Object.keys(input).map(key=>[Language.get(this.languageNameSpace+input[key]),key]);

        this.fieldInstructions.push((fld:any)=>fld.appendField(new Blockly.FieldDropdown(dropvalues),key));
        
        return this;
    }

    withCustomUi(){
        return new SettingsUIBuilder(this.onUiCompleted.bind(this), this.languageNameSpace);
    }

    register(name: string){
        const handler = this;
        Blockly.Blocks[name] = {
            init: function(){
                // Generates the general dummy-input for all sub-fields
                var dummy = this.appendDummyInput();

                // Performs the language-lookup and segmentation (One segment more than fields to have one before and after every field)
                var segment = Language.getSegmented(handler.languageNameSpace, handler.fieldInstructions.length+1);

                // Iterates over every segment
                for(var i = 0; i < segment.length; i++){

                    // Gets the text-segment
                    var txt = segment[i];

                    // Writes the segment before the next field
                    if(txt.trim().length > 0)
                        dummy.appendField(txt);

                    // Executes the field instruction (if it is not one over)
                    if(i < handler.fieldInstructions.length)
                        handler.fieldInstructions[i](dummy);
                }

                // Executes extra block instructions
                for(var instr of handler.blockInstructions)
                    instr(this);

                this.setInputsInline(true);
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(handler.hueRotation);
            }
        }
    }
}