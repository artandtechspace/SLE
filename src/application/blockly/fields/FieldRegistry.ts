import FieldBrightness from "./FieldBrightness.js";
import FieldCustomColor from "./FieldCustomColor.js";

const Blockly = require("blockly");

// Registers all custom blockly-block-fields
export default function registerCustomFields(){
    Blockly.fieldRegistry.register("field_custom_color", FieldCustomColor);
    Blockly.fieldRegistry.register("field_brightness", FieldBrightness);
}