import FieldCustomColor from "./FieldCustomColor.js";

const Blockly = require("blockly");

export default function registerCustomFields(){
    Blockly.fieldRegistry.register("field_custom_color", FieldCustomColor);
}