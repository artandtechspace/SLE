import { isPercentageNumber, PercentageNumber } from "../../../types/Types.js";
import { BrightnessPicker } from "../../../ui/utils/BrightnessPicker.js";
import { isNumberEV } from "../../../utils/ElementValidation.js";
import { create } from "../../../utils/HTMLBuilder.js";
import { SupplierElement } from "./BaseElement.js";

export class BrightnessPickerElement extends SupplierElement<PercentageNumber, PercentageNumber>{
    private popup: BrightnessPicker;

    // Preview html of the color-chooser
    private renderRect: HTMLDivElement = null as any as HTMLDivElement;
    
    constructor(key: string, value?: PercentageNumber){
        var popup = new BrightnessPicker(value);
        super(key, popup.brightness);

        this.popup=popup;
        this.popup.setChangeListener(this.onValueChange.bind(this));
        
        this.generateRenderRect()
    }

    // Event: When the render-rect get's focused
    private onFocusPreview(){
        this.popup.reRender();
    }

    // Event: When the value of the brightness-picker changes
    private onValueChange(value: PercentageNumber){
        this.setValue(value);
        this.updateRectBackground()
    }

    // Updates the render-rect color
    private updateRectBackground(){
        this.renderRect.style.background = `hsl(0, 0%, ${this.popup.brightness*100}%)`;
    }

    // Generates the html-content for the render-rect once
    private generateRenderRect(){
        this.renderRect = create("div", {
            cls: "bsg-color-rect",
            evts: {
                "focus": this.onFocusPreview.bind(this)
            },
            attr: {
                "tabindex": 0
            }
        }) as HTMLDivElement;
    
        this.updateRectBackground()
    
        this.popup.openGuiAt(this.renderRect);
    }

    render(): HTMLElement {
        return this.renderRect;
    }

    validateParseAndGetValue(): PercentageNumber {
        return this.getValue();
    }

    serialize(): any {
        return this.getValue();
    }

    deserialize(raw: any): boolean {
        
        // Checks if the element is valid
        if(!isNumberEV(raw) || !isPercentageNumber(raw))
            return false;
        
        // Updates value
        this.setValue(raw);

        // Updates the popup and rerenders it
        this.popup.brightness = raw;
        this.updateRectBackground();
        this.generateRenderRect();

        return true;
    }
}