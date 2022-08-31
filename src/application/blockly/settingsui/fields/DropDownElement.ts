import { isStringEV } from "../../../utils/ElementValidation.js";
import { create } from "../../../utils/HTMLBuilder.js";
import { SupplierElement } from "./BaseElement.js";

export class DropDownElement extends SupplierElement<number, string>{

    // List with all values that can be used
    private readonly valueList: string[];

    constructor(key: string, valueList: string[], selectIdx: number = 0){
        super(key, selectIdx);

        this.valueList = valueList;
    }

    // Event: When the selection on the dropdown-html-element changes.
    //        Eg. when the user selects a different element
    private onDropDownChange(evt: Event){
        this.setValue((evt.target as HTMLSelectElement).selectedIndex);
    }

    render(): HTMLElement {
        // Renders the children
        var children = this.valueList.map(cld=>create("option",{
            text: cld
        }));
        
        // Creates the base element
        var select = create("select",{
            cls: "bsg-dropdown",
            chld: children,
            evts: {
                "change": this.onDropDownChange.bind(this)
            }
        }) as HTMLSelectElement;

        // Sets the selected index
        select.selectedIndex = this.getValue();

        return select;
    }

    validateParseAndGetValue(): string {
        return this.valueList[this.getValue()];
    }

    serialize(): any {
        return this.valueList[this.getValue()];
    }

    deserialize(raw: any): boolean {

        // Ensures the value is a string
        if(!isStringEV(raw))
            return false;

        // Checks if the value is inside the list
        var idx = this.valueList.indexOf(raw);

        if(idx == -1)
            return false;
        
        // Updates value
        this.setValue(idx);

        return true;
    }

}