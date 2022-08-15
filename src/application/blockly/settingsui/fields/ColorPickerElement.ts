import { HSV } from "../../../types/Types.js";
import { HSVColorPicker } from "../../../ui/utils/HSVColorPicker.js";
import { HSV2HEX, isValidHSV } from "../../../utils/ColorUtils.js";
import { isObjectEV } from "../../../utils/ElementValidation.js";
import { create } from "../../../utils/HTMLBuilder.js";
import { SupplierElement } from "./BaseElement.js";

export class ColorPickerElement extends SupplierElement<HSV, HSV>{
    private popup: HSVColorPicker;

    // Preview html of the color-chooser
    private renderRect: HTMLDivElement = null as any as HTMLDivElement;
    
    constructor(key: string, value?: HSV){
        var popup = new HSVColorPicker(value);
        super(key, popup.color);

        this.popup=popup;
        this.popup.setChangeListener(this.onValueChange.bind(this));
        
        this.generateRenderRect()
    }

    // Event: When the render-rect get's focused
    private onFocusPreview(){
        this.popup.reRender();
    }

    // Event: When the value of the color-picker changes
    private onValueChange(value: HSV){
        this.setValue(value);
        this.updateRectBackground()
    }

    // Updates the render-rect color
    private updateRectBackground(){
        this.renderRect.style.background = HSV2HEX(this.popup.color.h,this.popup.color.s,this.popup.color.v)
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

    validateParseAndGetValue(): HSV {
        return this.getValue();
    }

    serialize(): any {
        return this.getValue();
    }

    deserialize(raw: any): boolean {
        
        // Checks if the element is valid
        if(!isObjectEV(raw) || !isValidHSV(raw))
            return false;
        
        // Updates value
        this.setValue(raw);

        // Updates the popup and rerenders it
        this.popup.color = raw;
        this.updateRectBackground();
        this.generateRenderRect();

        return true;
    }
}