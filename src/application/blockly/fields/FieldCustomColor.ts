import { HSV2HEX } from "../../utils/ColorUtils.js";
import { create as C } from "../../utils/HTMLBuilder.js";
const Blockly = require("blockly");


// Validates the input-color as an hsv-object. Return null if invalid and the object if valid.
function validateInputColor(value: any){
    // Ensures the value is an object
    if(typeof value !== "object")
      return null;
    
    // Checks for the keys
    if(Object.keys(value).length !== 3)
      return null;
  
    // Gets the keys
    var keys = Object.keys(FieldCustomColor.DEFAULT_VALUE);
  
    // Checks if the given value is okay
    const isValid=(x: any)=>{
      // Gets the value
      var val = value[x];
  
      return typeof val === "number" && val >= 0 && val <= 1;
    }
  
    // Checks if the keys are given and valid
    if(keys.filter(isValid).length > 0)
      return null;
  
    return value;
}

export default class FieldCustomColor extends Blockly.Field{

    // Default value for the field
    static DEFAULT_VALUE = {
      h: 0,
      s: 1,
      v: 1
    };
    
    constructor(opt_value?: any, opt_validator?: (value:any)=>boolean){
        opt_value = validateInputColor(opt_value);
        if(opt_value === null)
            opt_value = FieldCustomColor.DEFAULT_VALUE;
      
        super(opt_value,opt_validator);
    }
  
    // Create an field from a given json object
    static fromJson(options: object){
        return new FieldCustomColor(options["color" as keyof typeof options]);
    }
  
    // Event: When the field gets initalized
    initView(){
        // Create the color-preview
        this.createBorderRect_();
        this.borderRect_.style.fillOpacity = 1;
    }
  
    // Event: When the size of the field gets calculated
    updateSize_(){
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
    disposeEditor_(){
        // Removes the editor fields
        this.openEditorField_ = undefined;
    }
  
    // Event: When the editor get's opened
    showEditor_(){
  
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
      var sliderColor = createSlider("colorH",h,evt=>evtMapper(evt,"h"));
      var sliderLight = createSlider("colorV",v,evt=>evtMapper(evt,"v"));
      var sliderSaturation = createSlider("colorS",s,evt=>evtMapper(evt,"s"));
  
      // Creates the html-part
      
      Blockly.DropDownDiv.getContentDiv().appendChild(C("div",{
        chld: [
          C("p",{ text: "Color" }),
          sliderColor.html,
          C("p",{ text: "Brightness" }),
          sliderLight.html,
          C("p",{ text: "Saturation" }),
          sliderSaturation.html
        ],
        cls:"blockly-custfield-colorslider-popup"
      }));
      
      // Sets the block-background color as the dropdown background-color
      Blockly.DropDownDiv.setColour(this.sourceBlock_.style.colourPrimary,this.sourceBlock_.style.colourTertiary);
  
      // Attaches the sliders
      this.openEditorField_ = {
        h: sliderColor.canvas,
        s: sliderSaturation.canvas,
        v: sliderLight.canvas
      }
  
      // Opens the dropdown and registers the close-handler
      Blockly.DropDownDiv.showPositionedByField(this, this.disposeEditor_.bind(this));
  
      this.render_(true);
    }
  
    getText_(){
      var {h,s,v} = this.getValue();
      return HSV2HEX(h,s,v);
    }
  
    // (Re)renders the slider
    renderSlider(field: string){
      // Gets the canvas
      var canvas = this.openEditorField_[field];
  
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
    onValueChange(value: string,name: string){
      this.setValue({
        ...this.getValue(),
        [name]: parseInt(value)/1000
      });
  
      // Registers the specific element for a redraw
      this.dirtyElement = name;
  
      this.render_();
    }
  
    // Event: Render event
    render_(forceSliderUpdate=false){
  
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