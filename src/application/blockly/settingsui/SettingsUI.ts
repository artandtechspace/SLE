import { SystemError } from "../../errorSystem/Errors.js";
import { SettingsUIBuilder } from "./Builder.js";
import { Element, SupplierElement } from "./fields/BaseElement.js";
import { SettingsUIManager } from "./Manager.js";

export class SettingsUI{
    // Basic element-structure
    private elements: Element[];

    constructor(elements: Element[]){
        this.elements = elements;
    }

    // Builds the html-tree from the settings
    public render() : HTMLElement[]{
        return this.elements.map(elm=>elm.render());
    }

    /**
     * Returns the field value from the field with the name of @param name
     * @throws {SystemError} if the field couldn't be found.
     */
    public getValueByName<T>(name: string) : T{
        // Searches for the element with that name
        for(var elm of this.elements)
            if(elm instanceof SupplierElement && name===elm.key)
                return elm.getValue() as T;

        throw new SystemError("Failed to find ui-element with name '"+name+"'.");
    }
}

// Function to create a settings-ui-builder on an block
export const createUI = ()=>new SettingsUIBuilder(Manager.getChangeCallback());
// SettingsUi-Manager
export const Manager = new SettingsUIManager();