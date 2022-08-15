import { LoadingError, EnvDeserialisationError } from "../../errorSystem/Errors.js";
import { handleProgrammingError } from "../../errorSystem/ProgrammingErrorSystem.js";
import { Language, LanguageRef, LVarSet } from "../../language/LanguageManager.js";
import { OpenObject } from "../../types/Types.js";
import { create } from "../../utils/HTMLBuilder.js";
import { SettingsUIBuilder } from "./Builder.js";
import { Element, SupplierElement } from "./fields/BaseElement.js";
import { SettingsUIManager } from "./Manager.js";

// Line of elements for the settings-ui
export type SettingsUiLine = Element[];

export class SettingsUI{
    // Basic element-structure
    private lines: SettingsUiLine[];

    constructor(lines: SettingsUiLine[]){
        this.lines = lines;
    }

    // Builds the html-tree from the settings
    public render() : HTMLElement[]{
        // Creates a line-list where all elements on a line are wrapped inside a "div.line"-element
        return this.lines.map(line=>{
            return create("div",{
                cls: "line",
                chld: line.map(elm=>elm.render())
            })
        })
    }

    /**
     * Returns the field value from the field with the name of @param name
     * @throws {LanguageRef} as the error-message if an error occurred
     */
    public validateAndGetValueByName<T>(name: string) : T{
        // Searches for the element with that name
        for(var line of this.lines)
            for(var elmnt of line)
                if(elmnt instanceof SupplierElement && name===elmnt.key)
                    // Checks if the value is valid and if so returns it
                    return elmnt.validateParseAndGetValue() as T;

        return handleProgrammingError("Failed to find ui-element with name '"+name+"'");
    }

    /**
     * Saves the block-ui's state as a json-object. The same object can later be loaded by the deserialize function
     */
    public serialize() : OpenObject{
        // Object that stores all serialized values as key:value (Both strings)
        var serialized: OpenObject = {};

        // Iterates over all elements and stores these serialized values
        for(var line of this.lines)
            for(var elmnt of line)
                if(elmnt instanceof SupplierElement)
                    serialized[elmnt.key] = elmnt.serialize();
        
        return serialized;
    }

    /**
     * Loads previously serialized content into the settingsui.
     * @param content the raw loaded values to deserialize to the values.
     * @throws {LoadingError} if a value got serialized invalid and can't be deserialized
     */
    public deserialize(content: OpenObject){
        // Loads all serialized values back in
        for(var line of this.lines)
            for(var elmnt of line)
                if(elmnt instanceof SupplierElement){
                    // Gets value
                    var val = content[elmnt.key];

                    // Ensures the value is given
                    if(val === undefined)
                        continue;

                    // Deserializes the value
                    if(!elmnt.deserialize(val))
                        throw new LoadingError("import.error.deserialize.settingsui.field", elmnt.key);
                }
    }
}

// Function to create a settings-ui-builder on an block
export const createUI = ()=>new SettingsUIBuilder(Manager.getChangeCallback());
// SettingsUi-Manager
export const Manager = new SettingsUIManager();