import { Language, LanguageRef } from "../../language/LanguageManager.js";
import { OpenObject, PercentageNumber } from "../../types/Types.js";
import FieldBrightness from "../fields/FieldBrightness.js";
import FieldCustomColor from "../fields/FieldCustomColor.js";
import { SettingsUIBuilder } from "../settingsui/Builder.js";
import { SettingsUIManager } from "../settingsui/Manager.js";
import { Manager, SettingsUI } from "../settingsui/SettingsUI.js";

const Blockly = require("blockly");

// Creates a blockly-style builder instance with the given hue-rotation
export const createBlocklyStyle = (hueRotation: number, languageNameSpace: string)=>new BlocklyStyleBuilder(hueRotation, languageNameSpace);

class BlocklyStyleBuilder{

    // Instructions to execute on the default-field
    private fieldInstructions: [(()=>any), string][] = [];
    // Instructions to execute on the block itself
    private blockInstructions: any[] = [];

    // Hue-rotation color of the block
    private hueRotation: number;

    // Namespace to put before every language lookup
    private languageNameSpace: string;

    private ui?: SettingsUI;

    constructor(hueRotation: number, languageNameSpace: string){
        this.hueRotation = hueRotation;

        this.languageNameSpace = languageNameSpace;
    }

    // Event: Gets used when the callback ends on the custom-ui
    private onUiCompleted(exported: SettingsUI){
        this.ui = exported;
        return this;
    }

    withTextfield(key: string, value: string){
        this.fieldInstructions.push([()=>new Blockly.FieldTextInput(value), key]);

        return this;
    }

    // Add a brightness field
    withFieldBrightness(key: string, v?:number){
        this.fieldInstructions.push([()=>new FieldBrightness(v), key]);

        return this;
    }

    // Add a custom-color field
    withFieldCustomColor(key: string, h?: number, s?: number, v?:number){
        this.fieldInstructions.push([()=>new FieldCustomColor({h: h as PercentageNumber, s: s as PercentageNumber, v: v as PercentageNumber}), key]);

        return this;
    }

    // Adds a dropdown field with the options given inside the input-variable as key:value pairs
    withFieldDropdown(key: string, input: {[key: string]: string}){
        // Brings the drop-down values into the correct format and also directly resolves the language lookups
        var dropvalues = Object.keys(input).map(key=>[Language.get(this.languageNameSpace+input[key]),key]);
    
        this.fieldInstructions.push([()=>new Blockly.FieldDropdown(dropvalues),key]);
        
        return this;
    }

    // Adds a custom-ui to the block (Call the endCustomUi to get the callchain back to this class)
    withCustomUi(){
        return new SettingsUIBuilder(this.onUiCompleted.bind(this), this.languageNameSpace);
    }

    // Performs the final register of the block
    register(name: string){
        const hue = this.hueRotation;
        const ui = this.ui;

        // Performs the language-lookup and segmentation (One segment more than fields to have one before and after every field)
        const languageSeg = Language.getSegmented(this.languageNameSpace, this.fieldInstructions.length+1);

        // Will hold all blockly-fields that are to be added to the final block
        const blockFields : [(()=>any)|string, string?][] = []; 

        // Iterates over every segment
        for(var i = 0; i < languageSeg.length; i++){

            // Gets the text-segment
            var txt = languageSeg[i];

            // Writes the segment before the next field
            if(txt.trim().length > 0)
                blockFields.push([txt, undefined]);

            // Executes the field instruction (if it is not one over)
            if(i < this.fieldInstructions.length)
                blockFields.push(this.fieldInstructions[i]);
        }

        Blockly.Blocks[name] = {
            init: function(){
                // Generates the general dummy-input for all sub-fields
                var dummy = this.appendDummyInput();

                // Adds all blockly-fields
                for(var field of blockFields){

                    if(typeof field[0] === "string")
                        dummy.appendField(field[0]);
                    else
                        dummy.appendField(field[0](), field[1]);
                }

                // Adds the custom-ui if one exists
                if(ui !== undefined){
                    // Appends the ui to the block
                    this.settingsui = ui;

                    // Seriablizer
                    this.saveExtraState = ()=>ui.serialize(this);
                    
                    // Deserializer
                    // If the ui.deserialize-function throws an error, it will be catched by the general
                    // deserialize-logic inside the ErrorSystem.importFromString with the blockly-serializsation logic
                    this.loadExtraState = (obj: OpenObject)=>ui.deserialize(this, obj);

                    // Fires the initalize event for the ui on that block
                    ui.onInit(this, Manager.getChangeCallback());
                }

                this.setInputsInline(true);
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(hue);
            }
        }
    }
}