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
                // Input
                create("input", {
                    attr: {
                        "type": "number",
                        "min": this.settings.min,
                        "max": this.settings.max,
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

    serialize(): string {
        return this.getValue().toString();
    }

    deserialize(raw: string): boolean {
        // Loads the value
        var psd = this.settings.parseMode === ParseMode.FLOAT ? parseFloat(raw) : parseInt(raw);

        // Checks if the value failed to load
        if(isNaN(psd))
            return false;

        // Updates value
        this.setValue(psd);

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