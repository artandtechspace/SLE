import { isPercentageNumber, PercentageNumber } from "../../types/Types";
import { BrightnessPicker } from "../../ui/utils/BrightnessPicker";
import { isNumberEV } from "../../utils/ElementValidation";
const Blockly = require("blockly");

export default class FieldBrightness extends Blockly.Field{
  // Makes the field serializeable
  public SERIALIZABLE = true;

  // Color-picker popup element
  private colorPicker: BrightnessPicker;

  constructor(opt_value: PercentageNumber|any = null){
    opt_value = FieldBrightness.validateInputBrightness(opt_value, null);

    // Creates the color-picker
    var colorPicker = new BrightnessPicker(opt_value == null ? undefined : opt_value);

    super(colorPicker.brightness);
    
    // Initalizes the color-picker
    this.colorPicker = colorPicker;
    colorPicker.setChangeListener(this.onPickerValueChange.bind(this));
  }

  private onPickerValueChange(value: PercentageNumber) : void{
    // Syncs the value
    this.setValue(value);

    // (Re)renders the preview-element
    this.render_();
  }



  // Validates the input-color as an hsv-object. Return null if invalid and the object if valid.
  private static validateInputBrightness(value: any, defaultReturn: PercentageNumber|null): PercentageNumber|null{
      return isNumberEV(value) && isPercentageNumber(value) ? value : defaultReturn;
  }

  // Create an field from a given json object
  private static fromJson(options: object){
      return new FieldBrightness(options["brightness" as keyof typeof options]);
  }

  // Validator for new values to the class
  private doClassValidation_(newValue: any){
    return FieldBrightness.validateInputBrightness(newValue, null);
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
    // Opens the color-picker
    this.colorPicker.openGuiAt(Blockly.DropDownDiv.getContentDiv());
    
    // Sets the block-background color as the dropdown background-color
    Blockly.DropDownDiv.setColour(this.sourceBlock_.style.colourPrimary,this.sourceBlock_.style.colourTertiary);

    // Opens the dropdown and registers the close-handler
    Blockly.DropDownDiv.showPositionedByField(this, this.disposeEditor_.bind(this));
    
    this.colorPicker.reRender();
  }

  private getText_(){
    return Math.round(this.getValue() * 100)+"%";
  }

  // Event: Render event
  private render_(){
    // Updates the preview-element
    this.borderRect_.style.fill = `hsl(0, 0%, ${this.getValue()*100}%)`;

    super.render_();
  }
}