import { CalculationError } from "../../../errorSystem/Errors.js";
import { performCalculation } from "../../../parameterCalculator/Calculator.js";
import { createSizeableTF } from "../../../ui/utils/SizeableTF.js";
import { isStringEV } from "../../../utils/ElementValidation.js";
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

export class NumericFieldElement extends SupplierElement<string, number>{
    public readonly settings: NumericFieldSettings;

    constructor(key: string, value: string, settings: NumericFieldSettings){
        super(key, value);
        this.settings=settings;
    }

    public render(): HTMLElement {
        return createSizeableTF(create("input",{
            attr: {
                "value": this.getValue()
            },
            evts: {
                "input": (evt: any)=>this.setValue(evt.target.value)
            }
        }) as HTMLInputElement);
    }

    validateParseAndGetValue(): string|number {

        try{

            // Performs the calculation
            var value = performCalculation(this.getValue());
    
            // Performs all kinds of checks for the value
    
            // Numeric check (Should normally always be okay)
            if(isNaN(value))
                return "nan";
            // Min check
            if(this.settings.min !== undefined && value < this.settings.min)
                return "min";
            // Max check
            if(this.settings.max !== undefined && value < this.settings.max)
                return "max";
            // Float/Int check
            if(this.settings.parseMode===ParseMode.INT && !Number.isInteger(value))
                return "val";

            return value;
        }catch(err){
            return (err as CalculationError).message;
        }

    }

    serialize(): any {
        return this.getValue();
    }

    deserialize(raw: any): boolean {
        // Checks if the value is a string
        if(!isStringEV(raw))
            return false;

        // Tries to parse the number
        var asNm : number = parseFloat(raw);

        // Checks if the value failed to load
        if(isNaN(asNm))
            return false;

        // Checks if int expected, but float found
        if(this.settings.parseMode === ParseMode.INT && !Number.isInteger(asNm))
            return false;
        
        // Updates value
        this.setValue(raw);

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
        return new NumericFieldElement(this.key, this.value.toString(), this.settings);
    }
}