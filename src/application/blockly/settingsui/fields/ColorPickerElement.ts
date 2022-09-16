import { HSV } from "../../../types/Types";
import { HSVColorPicker } from "../../../ui/utils/HSVColorPicker";
import { HSV2HEX, isValidHSV } from "../../../utils/ColorUtils";
import { isObjectEV } from "../../../utils/ElementValidation";
import { create } from "../../../utils/HTMLBuilder";
import { SupplierElement } from "./BaseElement";

export class ColorPickerElement extends SupplierElement<HSV, HSV>{
    private popup: HSVColorPicker;

    // Preview html of the color-chooser
    private renderRect: HTMLDivElement = null as any as HTMLDivElement;
    
    constructor(key: string, value?: HSV){
        var popup = new HSVColorPicker(value);
        super(key, popup.color);

        this.popup=popup;
        
        this.generateRenderRect()
    }

    // Event: When the render-rect get's focused
    private onFocusPreview(){
        this.popup.reRender();
    }

    // Event: When the value of the color-picker changes
    private onValueChange(block: any, value: HSV){
        this.setValue(block, Object.assign({}, value));
        this.updateRectBackground()
    }

    // Updates the render-rect color
    private updateRectBackground(){
        var {h, s, v} = this.popup.color;

        this.renderRect.style.background = HSV2HEX(h,s,v);
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

    render(block: any): HTMLElement {
        this.popup.color = this.getValue(block);
        this.popup.setChangeListener((value: HSV)=>this.onValueChange(block, value));
        this.updateRectBackground();
        return this.renderRect;
    }

    validateParseAndGetValue(block: any): HSV {
        return this.getValue(block);
    }

    serialize(block: any): any {
        return this.getValue(block);
    }

    deserialize(block: any, raw: any): boolean {
        
        // Checks if the element is valid
        if(!isObjectEV(raw) || !isValidHSV(raw))
            return false;
        
        // Updates value
        this.setValue(block, raw);

        // Updates the popup and rerenders it
        this.popup.color = raw;
        this.updateRectBackground();
        this.generateRenderRect();

        return true;
    }
}