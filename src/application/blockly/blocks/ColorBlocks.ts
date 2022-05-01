import { BlockError } from "../../errorSystem/Error.js";
import { HSV2HEX } from "../../utils/ColorUtils.js";
import { getNumberFromCode, packageBlockConfig } from "../BlocklyUtils.js";
import FieldCustomColor from "../fields/FieldCustomColor.js";

const Blockly = require("blockly");

/**
 * This file registers all blocks that are using the color-module. Eg. generate configs for it
 */


export default function registerColorBlocks(){
    registerSingleLed();
    registerStripe();
    registerStepsColor();

}



// General color module with spaces between leds
function registerStepsColor(){
    Blockly.Blocks['sle_steps_color'] = {
        init: function() {
            this.appendValueInput("steps")
                .setCheck("Number")
                .appendField("Color");
            this.appendValueInput("start")
                .appendField("step(s) from")
                .setCheck("Number");
            this.appendValueInput("space-between-steps")
                .appendField("in")
                .appendField(new FieldCustomColor(), "color")
                .appendField("with")
                .setCheck("Number")
            this.appendValueInput("step-length")
                .appendField("leds space every")
                .setCheck("Number");
            this.appendDummyInput()
                .appendField("leds.");
            this.setColour(130);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setInputsInline(true);
        }
    };

    Blockly.JavaScript['sle_steps_color'] = function(block:any) {
        // Variables
        var start = getNumberFromCode(block,"start", 0);
        var steps = getNumberFromCode(block,"steps", 1);

        // How many leds to skip between steps
        var skipLen = getNumberFromCode(block,"space-between-steps", 1);

        // How long each step is
        var skipStart = getNumberFromCode(block,"step-length", 1);

        // RGB-Color
        var hsv = block.getFieldValue('color');

        // Assembles the config
        return packageBlockConfig({
            "name": "color",
            "config": {
                "start": start,
                "ledsPerStep": skipStart,      
                "rgb": HSV2HEX(hsv.h,hsv.s,hsv.v,true),
                "spaceBetweenSteps": skipLen,
                "steps": steps
            }
        });
    };
}

// Colors multiple leds in a row
function registerStripe(){
    Blockly.Blocks['sle_simple_stripe_color'] = {
        init: function() {
            this.appendValueInput("start")
                .setCheck("Number")
                .appendField("Color leds");
            this.appendValueInput("end")
                .setCheck("Number")
                .appendField("to");
            this.appendDummyInput()
                .appendField("in")
                .appendField(new FieldCustomColor(), "color");
            this.setColour(130);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setInputsInline(true);
        }
    };

    Blockly.JavaScript['sle_simple_stripe_color'] = function(block:any) {
        var start: number = getNumberFromCode(block,"start", 0);
        var end: number = getNumberFromCode(block,"end");
        var hsv = block.getFieldValue('color');

        // How many leds are used
        var amt = end-start;

        // Checks if an invalid length got specified
        if(amt <= 0)
            throw new BlockError("The specified 'end'-value is eiter the 'start'-value or below the 'start'-value.", block);

        // Assembles the config
        return packageBlockConfig({
            "name": "color",
            "config": {
                "start": start,
                "ledsPerStep": amt,      
                "rgb": HSV2HEX(hsv.h,hsv.s,hsv.v,true)
            }
        });
    };
}

// Single-led
function registerSingleLed(){
    Blockly.Blocks['sle_simple_single_color'] = {
        init: function() {
            this.appendValueInput("led")
                .setCheck("Number")
                .appendField("Color led");
            this.appendDummyInput()
                .appendField("in")
                .appendField(new FieldCustomColor(), "color");
            this.setColour(130);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setInputsInline(true);
        }
    };

    Blockly.JavaScript['sle_simple_single_color'] = function(block:any) {
        // Gets the color as an rgb-value
        var hsv = block.getFieldValue('color');

        // Assembles the config
        return packageBlockConfig({
            "name": "color",
            "config": {
                "start": getNumberFromCode(block,"led"),      
                "rgb": HSV2HEX(hsv.h,hsv.s,hsv.v,true),
                "ledsPerStep": 1
            }
        });
    };
}