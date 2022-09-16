import { HSV } from "../../types/Types";
import { HSVColorPicker } from "../../ui/utils/HSVColorPicker";
import { HSV2HEX, isValidHSV } from "../../utils/ColorUtils";
import { isObjectEV } from "../../utils/ElementValidation";
const Blockly = require("blockly");



export default class FieldCustomColor extends Blockly.Field{

  // Makes the field serializeable
  public SERIALIZABLE = true;

  // Color-picker popup element
  private colorPicker: HSVColorPicker;

  constructor(opt_value: HSV|any = null){
    opt_value = FieldCustomColor.validateInputColor(opt_value, undefined);
  
    // Creates the color-picker
    var colorPicker = new HSVColorPicker(opt_value);

    super(colorPicker.color);
    
    // Initalizes the color-picker
    this.colorPicker = colorPicker;
    colorPicker.setChangeListener(this.onPickerValueChange.bind(this));
  }

  private onPickerValueChange(value: HSV) : void{
    // Syncs the value
    this.setValue({...value});

    // (Re)renders the preview-element
    this.render_();
  }



  // Validates the input-color as an hsv-object. Return null if invalid and the object if valid.
  private static validateInputColor(value: any, defaultReturn: any): HSV|null{
      // Ensures the value is an object
      if(!isObjectEV(value))
        return defaultReturn;

      return isValidHSV(value) ? value : defaultReturn;
  }

  // Create an field from a given json object
  private static fromJson(options: object){
      return new FieldCustomColor(options["color" as keyof typeof options]);
  }

  // Validator for new values to the class
  private doClassValidation_(newValue: any){
    return FieldCustomColor.validateInputColor(newValue, null);
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
    this.colorPicker.doCloseGui();
  }

  // Event: When the editor get's opened
  private showEditor_(){
    this.colorPicker.color = this.getValue();
    // Opens the color-picker
    this.colorPicker.openGuiAt(Blockly.DropDownDiv.getContentDiv());
    
    // Sets the block-background color as the dropdown background-color
    Blockly.DropDownDiv.setColour(this.sourceBlock_.style.colourPrimary,this.sourceBlock_.style.colourTertiary);

    // Opens the dropdown and registers the close-handler
    Blockly.DropDownDiv.showPositionedByField(this, this.disposeEditor_.bind(this));
    
    this.colorPicker.reRender();
  }

  private getText_(){
    var {h,s,v} = this.getValue();
    return HSV2HEX(h,s,v);
  }

  // Event: Render event
  private render_(){
    // Updates the preview-element
    var {h,s,v} = this.getValue();
    this.borderRect_.style.fill = HSV2HEX(h,s,v);

    super.render_();
  }
}