import { Language } from "../../../language/LanguageManager";
import { isStringEV } from "../../../utils/ElementValidation";
import { create } from "../../../utils/HTMLBuilder";
import { SupplierElement } from "./BaseElement";

export class DropDownElement extends SupplierElement<number, string>{

    // List with all values that can be used (Holds their name in the current language and their actual value)
    private readonly valueList: {lang: string, value: string}[];

    constructor(key: string, languageNamespace: string, valueList: string[], selectIdx: number = 0){
        super(key, selectIdx);

        // Converts the values directly to their language-key
        this.valueList = valueList.map(val=>{ return {
            lang: Language.get(languageNamespace+val),
            value: val
        }});
    }

    // Event: When the selection on the dropdown-html-element changes.
    //        Eg. when the user selects a different element
    private onDropDownChange(block: any, evt: Event){
        this.setValue(block, (evt.target as HTMLSelectElement).selectedIndex);
    }

    render(block: any): HTMLElement {
        // Renders the children
        var children = this.valueList.map(cld=>create("option",{
            text: cld.lang
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
        return this.valueList[this.getValue(block)].value;
    }

    serialize(block: any): any {
        return this.valueList[this.getValue(block)].value;
    }

    deserialize(block: any, raw: any): boolean {

        // Ensures the value is a string
        if(!isStringEV(raw))
            return false;

        // Checks if the value is inside the list
        var idx = this.valueList.findIndex(val=>val.value===raw);

        if(idx == -1)
            return false;
        
        // Updates value
        this.setValue(block, idx);

        return true;
    }

}