import { create, createIf } from "../../../utils/HTMLBuilder.js";
import { Element, ElementBuilderBase, SupplierElement } from "./BaseElement.js";
import { InfoIconElement } from "./InfoIconElement.js";

export enum ParseMode{
    FLOAT, INT
}

export type NumericFieldSettings = {
    min?: number,
    max?: number,
    steps?: number,
    parseMode: ParseMode,
    suffix?: string,
    infoText?: string
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
        // Optionally create an info-icon
        var optInfoIcon = this.settings.infoText === undefined ? undefined : new InfoIconElement(this.settings.infoText).render();

        return create("div",{
            chld: [
                // Text
                create("p",{ text: this.displayText }),
                
                // Input
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
                }),
                
                // Suffix
                createIf("p",{
                    text: this.settings.suffix,
                    cls: "suffix"
                },this.settings.suffix !== undefined),
                
                // Info-icon
                optInfoIcon,

                // Next-line
                create("br")
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
    private readonly displayText: string;

    constructor(base: Base, key: string, value: number, displayText: string){
        super(base);
        this.key = key;
        this.value = value;
        this.displayText = displayText;
    }

    public hasMin(min: number){
        this.settings.min = min;
        return this;
    }
    public hasMax(max: number){
        this.settings.max = max;
        return this;
    }

    public withSteps(steps: number){
        this.settings.steps = steps;
    }

    public useParseModeFloat(){
        this.settings.parseMode = ParseMode.FLOAT;
        return this;
    }

    public withInfoIcon(infoText: string){
        this.settings.infoText = infoText;
        return this;
    }

    public withSuffix(suffix: string){
        this.settings.suffix = suffix;
        return this;
    }

    public __getBuild(): Element {
        return new NumericFieldElement(this.key, this.value, this.displayText, this.settings);
    }
}