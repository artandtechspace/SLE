import { SystemError } from "../../errorSystem/Errors.js";
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
     * @throws {SystemError} if the field couldn't be found.
     */
    public getValueByName<T>(name: string) : T{
        // Searches for the element with that name
        for(var line of this.lines)
            for(var elmnt of line)
                if(elmnt instanceof SupplierElement && name===elmnt.key)
                    return elmnt.getValue() as T;

        throw new SystemError("Failed to find ui-element with name '"+name+"'.");
    }
}

// Function to create a settings-ui-builder on an block
export const createUI = ()=>new SettingsUIBuilder(Manager.getChangeCallback());
// SettingsUi-Manager
export const Manager = new SettingsUIManager();