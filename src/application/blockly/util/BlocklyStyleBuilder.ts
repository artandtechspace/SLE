import { Language, LanguageRef } from "../../language/LanguageManager.js";
import { PercentageNumber } from "../../types/Types.js";
import FieldBrightness from "../fields/FieldBrightness.js";
import FieldCustomColor from "../fields/FieldCustomColor.js";
import { SettingsUIBuilder } from "../settingsui/Builder.js";

const Blockly = require("blockly");


// Creates a blockly-style builder instance with the given hue-rotation
export const createBlocklyStyle = (hueRotation: number)=>new BlocklyStyleBuilder(hueRotation);

class BlocklyStyleBuilder{

    // Instructions to execute on the default-field
    private fieldInstructions: any[] = [];
    // Instructions to execute on the block itself
    private blockInstructions: any[] = [];

    // Hue-rotation color of the block
    private hueRotation: number;

    constructor(hueRotation: number){
        this.hueRotation = hueRotation;
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

    // Adds text to the block (Uses language lookups)
    withText(text: string){
        // TODO
        this.fieldInstructions.push((field:any)=>field.appendField(Language.get("debug."+text)));

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

    withField(key: string, field: any){
        this.fieldInstructions.push((fld:any)=>fld.appendField(field, key));

        return this;
    }

    withFieldDropdown(key: string, input: {[key: string]: string}){
        // TODO
        // Brings the drop-down values into the correct format and also directly resolves the language lookups
        var dropvalues = Object.keys(input).map(key=>[Language.get("debug."+input[key]),key]);

        this.fieldInstructions.push((fld:any)=>fld.appendField(new Blockly.FieldDropdown(dropvalues),key));
        
        return this;
    }

    withCustomUi(){
        return new SettingsUIBuilder(this.onUiCompleted.bind(this));
    }

    register(name: string){
        const handler = this;
        Blockly.Blocks[name] = {
            init: function(){
                var dummy = this.appendDummyInput();
                
                for(var instr of handler.fieldInstructions)
                    instr(dummy);

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