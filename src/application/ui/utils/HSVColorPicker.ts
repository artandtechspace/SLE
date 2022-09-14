import { Language } from "../../language/LanguageManager.js";
import { HSV, PercentageNumber, Range } from "../../types/Types.js";
import { HSV2HEX } from "../../utils/ColorUtils.js";
import { create as C } from "../../utils/HTMLBuilder.js";

// Form-bindings that holds the form-elements (Slider, Canvas and canvas-2d-context)
// for every slider (h, s, v) 
type InternalFormBindings = {
    [key in keyof HSV]: {
        slider: HTMLInputElement,
        canvas: HTMLCanvasElement,
        ctx: CanvasRenderingContext2D
    }
}

export class HSVColorPicker{

    // Default color
    private static readonly DEFAULT_COLOR : HSV = {
        h: 0 as PercentageNumber,
        s: 1 as PercentageNumber,
        v: 1 as PercentageNumber
    }

    // Current color (If set, the picker must be rerendered)
    private _color : HSV;

    // Form-bindings that are only present if the slider has currently an open gui
    private fromBindings?: InternalFormBindings;

    // Optional value listener
    private valueChangeListener?: (value: HSV)=>void;

    constructor(startColor? : HSV, ){
        this._color = startColor === undefined ? {...HSVColorPicker.DEFAULT_COLOR} : startColor;
    }
    
    public setChangeListener(onValueChange?: (value: HSV)=>void){
        this.valueChangeListener = onValueChange;
    }
    
    // Event: When the user clicks a slider inside the dropout gui
    private onSliderValueInput(name: keyof HSV, value: Range<0,1000>){

        // Updates the color
        this._color[name] = value/1000 as PercentageNumber;
        
        // Updates the gui (Rerenders the other sliders)
        switch(name){
            case 'h':
              this.renderSlider("s");
              this.renderSlider("v");
              break;
            case 's':
              this.renderSlider("h");
              this.renderSlider("v");
              break;
            case 'v':
              this.renderSlider("h");
              this.renderSlider("s");
              break;
        }

        // Executes the listener
        if(this.valueChangeListener !== undefined)
            this.valueChangeListener(this.color);
    }

    // Renders/Rerenders every canvas-slider
    public reRender(){

        // Ensures that the form is open
        if(this.fromBindings === undefined)
            return;

        // (Re)Renders all sliders once
        this.renderSlider("h");
        this.renderSlider("s");
        this.renderSlider("v");
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

        // Gets the current values
        var {h, s, v} = this._color;
  
        // Event-mapper (Takes in the input-event from one of the sliders
        // and forwards it to the handler-method with only the name h,s or v and it's
        // value as the range value from 0 to 1000)
        const evtMapper = (event: Event,name: keyof HSV)=>this.onSliderValueInput(name, (event.target as EventTarget)["valueAsNumber" as keyof typeof event.target]);

        // Generates the sliders
        var {binding: colorBind, html: colorHtml} = this.createSlider("colorH", h, evt=>evtMapper(evt,"h"));
        var {binding: saturationBind, html: saturationHtml} = this.createSlider("colorS", s, evt=>evtMapper(evt,"s"));
        var {binding: valueBind, html: valueHtml} = this.createSlider("colorV", v, evt=>evtMapper(evt,"v"));

        // Creates the html-body for the ui
        var body = C("div", {
            chld: [
                C("p",{ text: Language.get("ui.utils.colorpicker.color") }),
                colorHtml,
                C("p",{ text: Language.get("ui.utils.colorpicker.saturation") }),
                saturationHtml,
                C("p",{ text: Language.get("ui.utils.colorpicker.value") }),
                valueHtml
            ],
            cls:"hsv-color-picker_popup"
        });

        // Builds the form-bindings
        var bindings: InternalFormBindings = {
            h: colorBind,
            s: saturationBind,
            v: valueBind
        }

        return {
            body,
            bindings
        }
    }



    // Creates a slider for color, hue or saturation
    private createSlider(id: string,value: PercentageNumber,inputListener: EventListener){
  
        // Creates the slider
        var slider = C("input",{
          attr:{
            "type": "range",
            "min": 0,
            "max": 1000,
            "value": value*1000
          },
          evts:{ "input": inputListener }
        }) as HTMLInputElement;
  
        // Creates the drawable canvas
        var canvas = C("canvas") as HTMLCanvasElement;
  
        // Creates the form-binding-element
        var binding = {
            slider,
            canvas,
            ctx: canvas.getContext("2d") as CanvasRenderingContext2D
        }

        return {
            binding,
            html: C("div",{
                cls: "hsv-color-picker_slider",
                id,
                chld: [
                canvas, slider
                ]
            })
        }
    }

    // Updates the slider-positions
    public updateSliderPositions(){
        
        // Ensures that the form is open
        if(this.fromBindings === undefined)
            return;

        // Updates all sliders
        for(var name in this._color)
            this.fromBindings![name as keyof InternalFormBindings].slider.valueAsNumber = this._color[name as keyof HSV] * 1000;
    }


    // (Re)renders the slider
    private renderSlider(type: keyof HSV){
      
        // Gets the form-bind
        var {canvas, ctx} = this.fromBindings![type];

        // Gets the values
        var {h: cH, s: cS, v: cV} = this._color;
    
        // Size of the canvas
        var w = canvas.width;
        var h = canvas.height;
    
        // Color function
        var colorFunction = (function getColorGen(){
          switch(type){
            case "h":
              return (perc: number)=>HSV2HEX(perc,cS,cV);
            case "s":
              return (perc: number)=>HSV2HEX(cH,perc,cV);
            case "v": default:
              return (perc: number)=>HSV2HEX(cH,cS,perc);
          }
        })();
    
        // Iterates over every pixel
        for(let x = 0; x < canvas.clientWidth; x++){
          let perc = x/w;
    
          // Draws the color
          ctx.fillStyle = colorFunction(perc);
          ctx.fillRect(x,0,1,h);
        }
    }

    public get color(){
        return {...this._color};
    }

    public set color(value: HSV){
        this._color = {...value};

        if(this.fromBindings !== undefined){
            this.reRender();
            this.updateSliderPositions();
        }
    }
  
}