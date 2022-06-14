import { create } from "../../../utils/HTMLBuilder.js";
import { Element, ElementBuilderBase, SupplierElement } from "./BaseElement.js";

export enum ParseMode{
    FLOAT, INT
}

export type NumericFieldSettings = {
    min?: number,
    max?: number,
    parseMode: ParseMode
}

export class NumericFieldElement extends SupplierElement<number>{
    public readonly settings: NumericFieldSettings;

    constructor(key: string, value: number, settings: NumericFieldSettings){
        super(key, value);
        this.settings=settings;
        
    }

    public render(): HTMLElement {
        return create("div",{
            chld: [
                // Decoy element for sizing the input element like it's input text
                create("p", { cls: "decoy", text: this.getValue().toString() }),
                // Input
                create("input", {
                    attr: {
                        "type": "number",
                        "min": this.settings.min,
                        "max": this.settings.max,
                        "value": this.getValue()
                    },
                    evts: {
                        "input": this.onFieldInput.bind(this)
                    }
                })
            ],
            cls: "bsg-number-input"
        })
    }

    // Event: When the value of this field changes (Fires on every single small change)
    private onFieldInput(evt: any){
        // Updates the set value
        this.setValue(evt.target.valueAsNumber);
        // Updates the decoy-element
        evt.target.parentElement.children[0].textContent = evt.target.value;
    }

    isValueValid(): string|void {
        // Gets the value
        var val = this.getValue();

        // Performs all kinds of checks for the value
        
        // Numeric check (Should normally always be okay)
        if(isNaN(val))
            return "nan";
        // Min check
        if(this.settings.min !== undefined && val < this.settings.min)
            return "min";
        // Max check
        if(this.settings.max !== undefined && val < this.settings.max)
            return "max";
        // Float/Int check
        if(this.settings.parseMode===ParseMode.INT && !Number.isInteger(val))
            return "val";
    }

    serialize(): any {
        return this.getValue();
    }

    deserialize(raw: any): boolean {
        // Checks if the value failed to load
        if(isNaN(raw))
            return false;

        // Checks if int expected, but float found
        if(this.settings.parseMode === ParseMode.INT && !Number.isInteger(raw))
            return false;
        
        // Updates value
        this.setValue(raw);

        return true;
    }
}

export class NumericFieldBuilder<Base> extends ElementBuilderBase<Base>{

    // Optionsl settings
    private readonly settings: NumericFieldSettings = {
        parseMode: ParseMode.INT
    };

    // Required base settings
    private readonly key: string;
    private readonly value: number;

    constructor(base: Base, key: string, value: number){
        super(base);
        this.key = key;
        this.value = value;
    }

    public hasMin(min: number){
        this.settings.min = min;
        return this;
    }
    public hasMax(max: number){
        this.settings.max = max;
        return this;
    }

    public useParseModeFloat(){
        this.settings.parseMode = ParseMode.FLOAT;
        return this;
    }

    public __getBuild(): Element {
        return new NumericFieldElement(this.key, this.value, this.settings);
    }
}