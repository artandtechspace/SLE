import FieldBrightness from "./FieldBrightness";
import FieldCustomColor from "./FieldCustomColor";

const Blockly = require("blockly");

// Registers all custom blockly-block-fields
export default function registerCustomFields(){
    Blockly.fieldRegistry.register("field_custom_color", FieldCustomColor);
    Blockly.fieldRegistry.register("field_brightness", FieldBrightness);
}