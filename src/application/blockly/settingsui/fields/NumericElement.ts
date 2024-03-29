import { performCalculation } from "../../../parameterCalculator/Calculator";
import { createSizeableTF } from "../../../ui/utils/SizeableTF";
import { isStringEV } from "../../../utils/ElementValidation";
import { create } from "../../../utils/HTMLBuilder";
import { Element, ElementBuilderBase, SupplierElement } from "./BaseElement";

export enum ParseMode{
    FLOAT, INT
}

export type NumericFieldSettings = {
    min?: number,
    max?: number,
    parseMode: ParseMode
}

export class NumericFieldElement extends SupplierElement<string, number>{
    public readonly settings: NumericFieldSettings;

    constructor(key: string, value: string, settings: NumericFieldSettings){
        super(key, value);
        this.settings=settings;
    }

    public render(block: any): HTMLElement {
        return createSizeableTF(create("input",{
            attr: {
                "value": this.getValue(block)
            },
            evts: {
                "input": (evt: any)=>this.setValue(block, evt.target.value)
            }
        }) as HTMLInputElement);
    }

    validateParseAndGetValue(block: any): number {
        var value: number;

        // Performs the calculation and if an error occurred, forwards it
        value = performCalculation(this.getValue(block));
    
        // Performs all kinds of checks for the value

        // Numeric check (Should normally always be okay)
        if(isNaN(value))
            throw { key: "blocks.errors.fields.numeric.nan", vars: this.key };
        // Min check
        if(this.settings.min !== undefined && value < this.settings.min)
            throw { key: "blocks.errors.fields.numeric.min", vars: {
                "field": this.key,
                "min": this.settings.min
            }};
        // Max check
        if(this.settings.max !== undefined && value < this.settings.max)
            throw { key: "blocks.errors.fields.numeric.max", vars: {
                "field": this.key,
                "max": this.settings.max
            }};
        // Float/Int check
        if(this.settings.parseMode===ParseMode.INT && !Number.isInteger(value))
            throw { key: "blocks.errors.fields.numeric.int", vars: this.key };

        return value;
    }

    serialize(block: any): any {
        return this.getValue(block);
    }

    deserialize(block: any, raw: any): boolean {
        // Checks if the value is a string
        if(!isStringEV(raw))
            return false;
        
        // Updates value
        this.setValue(block, raw);
        return true;
    }
}

export class NumericFieldBuilder<Base> extends ElementBuilderBase<Base>{

    // Options settings
    private readonly settings: NumericFieldSettings = {
        parseMode: ParseMode.INT
    };

    // Required base settings
    private readonly key: string;
    private readonly value: string;

    constructor(base: Base, key: string, value: string){
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