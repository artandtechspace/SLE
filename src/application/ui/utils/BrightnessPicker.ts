import { Language } from "../../language/LanguageManager";
import { PercentageNumber, Range } from "../../types/Types";
import { HSV2HEX } from "../../utils/ColorUtils";
import { create as C } from "../../utils/HTMLBuilder";

type InternalFormBindings = {
    slider: HTMLInputElement,
    canvas: HTMLCanvasElement
}

export class BrightnessPicker{

    // Default brightness
    private static readonly DEFAULT_BRIGHTNESS : PercentageNumber = 1 as PercentageNumber;

    // Current color
    private _brightness : PercentageNumber;

    // Form-bindings that are only present if the slider has currently an open gui
    private fromBindings?: InternalFormBindings;

    // Optional value listener
    private valueChangeListener?: (value: PercentageNumber)=>void;

    constructor(startBrightness? : PercentageNumber, ){
        this._brightness = startBrightness === undefined ? BrightnessPicker.DEFAULT_BRIGHTNESS : startBrightness;
    }
    
    public setChangeListener(onValueChange?: (value: PercentageNumber)=>void){
        this.valueChangeListener = onValueChange;
    }
    
    // Event: When the user clicks a slider inside the dropout gui
    private onSliderValueInput(value: Range<0,1000>){

        // Updates the color
        this._brightness = value/1000 as PercentageNumber;

        // Executes the listener
        if(this.valueChangeListener !== undefined)
            this.valueChangeListener(this._brightness);
    }

    // Updates the slider-positions
    public updateSliderPositions(){
        
        // Ensures that the form is open
        if(this.fromBindings === undefined)
            return;

        // Updates the slider
        this.fromBindings.slider.valueAsNumber = this._brightness * 1000;
    }

    // Renders/Rerenders every canvas-slider
    public reRender(){

        // Ensures that the form is open
        if(this.fromBindings === undefined)
            return;

        var canvas = this.fromBindings.canvas;
        
        // Opens the context
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

        // Size of the canvas
        var w = canvas.width;
        var h = canvas.height;

        // Iterates over every pixel
        for (let x = 0; x < canvas.clientWidth; x++) {
            // Draws the color
            ctx.fillStyle = HSV2HEX(0, 0, x / w);
            ctx.fillRect(x, 0, 1, h);
        }
    }

    // Takes in an base element which the gui will be appended to
    public openGuiAt(element: HTMLElement){
        var {body, bindings} = this.buildDropoutGUI();

        // Loads the bindings to the class
        this.fromBindings = bindings;

        // Attaches the gui
        element.appendChild(body);
    }

    // Execute when the gui shall be closed (or is closed)
    public doCloseGui(){
        // Performs cleanup
        this.fromBindings = undefined;
    }

    // Creates the html-gui for the popup
    private buildDropoutGUI(){

        
        // Creates the slider
        var slider = C("input", {
            attr: {
                "type": "range",
                "min": 0,
                "max": 1000,
                "value": this._brightness * 1000
            },
            evts: { "input": (evt: any) => this.onSliderValueInput(evt.target.value) }
        }) as HTMLInputElement;


        // Creates the drawable canvas
        var canvas = C("canvas") as HTMLCanvasElement;

        // Generates the outer wrapper elements
        var body = C("div", {
            chld: [
            C("p", { text: Language.get("ui.utils.brightnessslider") }),
            C("div", {
                cls: "hsv-color-picker_slider",
                chld: [
                canvas, slider
                ]
            })
            ],
            // Also uses the same class as the customcolorfield because this is basically just a custom-color field without the color and value
            cls: "hsv-color-picker_popup"
        });

        return {
            body,
            bindings: {
                canvas,
                slider
            } as InternalFormBindings
        }
    }

    public get brightness(){
        return this._brightness;
    }

    public set brightness(value: PercentageNumber){
        this._brightness = value;

        if(this.fromBindings !== undefined){
            this.reRender();
            this.updateSliderPositions();
        }
    }
}