import { HSV, HSV2HEX, isValidHUE } from "../../utils/ColorUtils.js";
import { create as C } from "../../utils/HTMLBuilder.js";
const Blockly = require("blockly");



export default class FieldCustomColor extends Blockly.Field{
  
  // Default value for the field
  static DEFAULT_VALUE: HSV = {
    h: 0,
    s: 1,
    v: 1
  };

  SERIALIZABLE = true;

  isColorDisabled = false;
  isValueDisabled = false;
  isSaturationDisabled = false;
  
  constructor(opt_value: HSV|null = null, opt_validator?: (value:HSV)=>boolean){
    opt_value = FieldCustomColor.validateInputColor(opt_value);
    if(opt_value === null)
      opt_value = FieldCustomColor.DEFAULT_VALUE;
    
    super(opt_value,opt_validator);
  }

  // Removes the saturation slider
  disableSaturation(){
    this.isSaturationDisabled = true;
    return this;
  }

  // Removes the value slider
  disableValue(){
    this.isValueDisabled = true;
    return this;
  }

  // Removes the color slider
  disableColor(){
    this.isColorDisabled = true;
    return this;
  }
  
    // Validates the input-color as an hsv-object. Return null if invalid and the object if valid.
    private static validateInputColor(value: any): HSV|null{
        // Ensures the value is an object
        if(typeof value !== "object" || value === null)
          return null;

        return isValidHUE(value) ? value : null;
    }

    // Create an field from a given json object
    private static fromJson(options: object){
        return new FieldCustomColor(options["color" as keyof typeof options]);
    }
  
    // Validator for new values to the class
    private doClassValidation_(newValue: any){
      return FieldCustomColor.validateInputColor(newValue);
    }

    // Event: When the field gets initalized
    private initView(){
        // Create the color-preview
        this.createBorderRect_();
        this.borderRect_.style.fillOpacity = 1;
    }
  
    // Event: When the size of the field gets calculated
    private updateSize_(){
        // Updates width and height
        this.borderRect_.setAttribute(
            "width",
            this.size_.width = 25
        );

        this.borderRect_.setAttribute(
            "height",
            this.size_.height = 16
        );
    }
  
    // Event: When the editor get's closed
    private disposeEditor_(){
        // Removes the editor fields
        this.openEditorField_ = undefined;
    }
  
    // Event: When the editor get's opened
    private showEditor_(){
  
      // Creates a color-slider
      function createSlider(id: string,value: number,listener: EventListener){
  
        // Creates the slider
        var slider = C("input",{
          attr:{
            "type": "range",
            "min": 0,
            "max": 1000,
            "value": value*1000
          },
          evts:{ "input": listener }
        });
  
        // Creates the drawable canvas
        var canvas = C("canvas");
  
        return {
          canvas,
          html: C("div",{
            cls:"blockly-custfield-colorslider",
            id,
            chld: [
              canvas,slider
            ]
          })
        }
      }
  
      // Gets the current values
      var {h, s, v} = this.getValue();
  
      // Event-mapper
      const evtMapper = (event: Event,name: string)=>this.onValueChange((event.target as EventTarget)["value" as keyof typeof event.target], name);

      // Generates the sliders
      var sliderColor = this.isColorDisabled ? undefined : createSlider("colorH",h,evt=>evtMapper(evt,"h"));
      var sliderValue = this.isValueDisabled ? undefined : createSlider("colorV",v,evt=>evtMapper(evt,"v"));
      var sliderSaturation = this.isSaturationDisabled ? undefined : createSlider("colorS",s,evt=>evtMapper(evt,"s"));
  
      // Creates the html-part
      Blockly.DropDownDiv.getContentDiv().appendChild(C("div",{
        chld: [
          ...( this.isColorDisabled ? [] : [
            C("p",{ text: "Color" }),
            sliderColor?.html,
          ]),
          ...( this.isValueDisabled ? [] : [
            C("p",{ text: "Brightness" }),
            sliderValue?.html,
          ]),
          ...( this.isSaturationDisabled ? [] : [
            C("p",{ text: "Saturation" }),
            sliderSaturation?.html
          ]),
        ],
        cls:"blockly-custfield-colorslider-popup"
      }));
      
      // Sets the block-background color as the dropdown background-color
      Blockly.DropDownDiv.setColour(this.sourceBlock_.style.colourPrimary,this.sourceBlock_.style.colourTertiary);
  
      // Attaches the sliders
      this.openEditorField_ = {
        h: sliderColor?.canvas,
        s: sliderSaturation?.canvas,
        v: sliderValue?.canvas
      }
  
      // Opens the dropdown and registers the close-handler
      Blockly.DropDownDiv.showPositionedByField(this, this.disposeEditor_.bind(this));
  
      this.render_(true);
    }
  
    private getText_(){
      var {h,s,v} = this.getValue();
      return HSV2HEX(h,s,v);
    }
  
    // (Re)renders the slider
    private renderSlider(field: string){
      // Gets the canvas
      var canvas = this.openEditorField_[field];

      // Ensures the slider is enabled
      if(!canvas)
        return;
  
      // Opens the context
      const ctx = canvas.getContext("2d");
  
      // Gets the values
      var {h: cH, s: cS, v: cV} = this.getValue();
  
      // Size of the canvas
      var w = canvas.width;
      var h = canvas.height;
  
      // Color function
      var colorFunction = (function getColorGen(){
        switch(field){
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
  
    // Event: When one slider get's updated
    private onValueChange(value: string,name: string){
      this.setValue({
        ...this.getValue(),
        [name]: parseInt(value)/1000
      });
  
      // Registers the specific element for a redraw
      this.dirtyElement = name;
  
      this.render_();
    }
  
    // Event: Render event
    private render_(forceSliderUpdate=false){
  
      // Updates the color-style
      var {h,s,v} = this.getValue();
      this.borderRect_.style.fill = HSV2HEX(h,s,v);
  
      // Checks if all sliders have to be updated
      if(forceSliderUpdate){
        this.renderSlider("h");
        this.renderSlider("s");
        this.renderSlider("v");
      }else{
        // Checks if there is a dirty-element
        switch(this.dirtyElement){
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
  
        // Removes the dirty element
        this.dirtyElement = undefined;
      }
  
      super.render_();
    }
}