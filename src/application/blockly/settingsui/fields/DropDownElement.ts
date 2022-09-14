import { Language } from "../../../language/LanguageManager.js";
import { isStringEV } from "../../../utils/ElementValidation.js";
import { create } from "../../../utils/HTMLBuilder.js";
import { SupplierElement } from "./BaseElement.js";

export class DropDownElement extends SupplierElement<number, string>{

    // List with all values that can be used
    private readonly valueList: string[];

    // Namespace to perform the language lookups on
    private readonly languageNamespace: string;

    constructor(key: string, languageNamespace: string, valueList: string[], selectIdx: number = 0){
        super(key, selectIdx);

        this.languageNamespace = languageNamespace;

        // Only stores a list with all language-texts as the index is used to get which element is selected
        this.valueList = valueList.map(val=>Language.get(this.languageNamespace+val));
    }

    // Event: When the selection on the dropdown-html-element changes.
    //        Eg. when the user selects a different element
    private onDropDownChange(block: any, evt: Event){
        this.setValue(block, (evt.target as HTMLSelectElement).selectedIndex);
    }

    render(block: any): HTMLElement {
        // Renders the children
        var children = this.valueList.map(cld=>create("option",{
            text: cld
        }));
        
        // Creates the base element
        var select = create("select",{
            cls: "bsg-dropdown",
            chld: children,
            evts: {
                "change": (evt: Event) => this.onDropDownChange(block, evt)
            }
        }) as HTMLSelectElement;

        // Sets the selected index
        select.selectedIndex = this.getValue(block);

        return select;
    }

    validateParseAndGetValue(block: any): string {
        return this.valueList[this.getValue(block)];
    }

    serialize(block: any): any {
        return this.valueList[this.getValue(block)];
    }

    deserialize(block: any, raw: any): boolean {

        // Ensures the value is a string
        if(!isStringEV(raw))
            return false;

        // Checks if the value is inside the list
        var idx = this.valueList.indexOf(raw);

        if(idx == -1)
            return false;
        
        // Updates value
        this.setValue(block, idx);

        return true;
    }

}