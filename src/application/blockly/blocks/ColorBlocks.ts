import { HSV2HEX, HSVtoRGB } from "../../utils/ColorUtils.js";
import FieldCustomColor from "../fields/FieldCustomColor.js";

const Blockly = require("blockly");

/**
 * This file registers all blocks that are using the color-module. Eg. generate configs for it
 */

// Single-led
function registerSingleLed(){
    Blockly.Blocks['simple_single_color'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Set led")
                .appendField(new Blockly.FieldNumber(0), "led")
                .appendField("to")
                .appendField(new FieldCustomColor(), "color");
            this.setColour(230);
        }
    };

    Blockly.JavaScript['simple_single_color'] = function(block:any) {
        // Gets the color as an rgb-value
        var hsv = block.getFieldValue('color');

        // Assembles the config
        return JSON.stringify({
            "name": "color",
            "config": {
                "ledsPerStep": block.getFieldValue('led'),      
                "rgb": HSV2HEX(hsv.h,hsv.s,hsv.v,true)
            }
        });
    };
}


export default function registerColorBlocks(){
    registerSingleLed();

}