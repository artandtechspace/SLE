import { create } from "../../../utils/HTMLBuilder.js";
import { SupplierElement } from "./BaseElement.js";

export type NumericFieldSettings = {
    min?: number,
    max?: number,
    steps?: number
}

export class NumericFieldElement extends SupplierElement<number>{
    public readonly settings: NumericFieldSettings;
    public readonly displayText: string;

    constructor(key: string, value: number, displayText: string, settings: NumericFieldSettings){
        super(key, value);
        this.settings=settings;
        this.displayText = displayText;
    }

    public render(): HTMLElement {
        return create("div",{
            chld: [
                create("p",{ text: this.displayText }),
                create("input", {
                    attr: {
                        "type": "number",
                        "min": this.settings.min,
                        "max": this.settings.max,
                        "step": this.settings.steps,
                        "value": this.getValue()
                    },
                    evts: {
                        "change": this.onFieldChange.bind(this)
                    }
                })
            ],
            cls: "bsg-number-input"
        })
    }

    // Event: When the value of this field changes
    private onFieldChange(evt: any){
        // Ensures that the value is valid
        if(!evt.target.validity.valid)
            return;

        // Updates the set value
        this.setValue(evt.target.valueAsNumber)
    }
}