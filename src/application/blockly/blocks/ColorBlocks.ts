import { HSV2HEX } from "../../utils/ColorUtils.js";
import { packageBlockConfig } from "../BlockRegister.js";
import FieldCustomColor from "../fields/FieldCustomColor.js";

const Blockly = require("blockly");

/**
 * This file registers all blocks that are using the color-module. Eg. generate configs for it
 */

// General color module with spaces between leds
function registerGeneralColor(){
    Blockly.Blocks['sle_simple_color'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Color leds")
                .appendField(new Blockly.FieldNumber(0, 0), "start")
                .appendField("to")
                .appendField(new Blockly.FieldNumber(0), "end")
                .appendField("in")
                .appendField(new Blockly.FieldColour("#ff0000"), "color")
                .appendField(", but skip")
                .appendField(new Blockly.FieldNumber(1, 1), "skipLen")
                .appendField("leds every")
                .appendField(new Blockly.FieldNumber(1, 1), "skipStart")
                .appendField("leds.");
            this.setColour(230);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
        }
    };

    Blockly.JavaScript['sle_simple_color'] = function(block:any) {
        // Starts/End of the animation
        var start:number = block.getFieldValue('start');
        var end:number = block.getFieldValue('end');

        // RGB-Color
        var hsv = block.getFieldValue('color');

        // How long skips should be
        var skipLen:number = block.getFieldValue('skipLen');

        // After how many leds a skip should occurre
        var skipStart:number = block.getFieldValue('skipStart');

        // How many leds are used
        var amt = end-start;

        // Checks if an invalid length got specified
        if(amt <= 0)
            return "error.The specified 'end'-value is eiter the 'start'-value or below the 'start'-value.";

        // Assembles the config
        return packageBlockConfig({
            "name": "color",
            "config": {
                "start": start,
                "ledsPerStep": skipStart,      
                "rgb": HSV2HEX(hsv.h,hsv.s,hsv.v,true),
                "spaceBetweenSteps": skipLen,
                "steps": Math.ceil(amt/skipStart)
            }
        });
    };
}

// Colors multiple leds in a row
function registerStripe(){
    Blockly.Blocks['sle_simple_stripe_color'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Color leds")
                .appendField(new Blockly.FieldNumber(0, 0), "start")
                .appendField("to")
                .appendField(new Blockly.FieldNumber(0), "end")
                .appendField("in")
                .appendField(new FieldCustomColor(), "color")
                .appendField(".");
            this.setColour(230);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
        }
    };

    Blockly.JavaScript['sle_simple_stripe_color'] = function(block:any) {
        var start: number = block.getFieldValue('start');
        var end: number = block.getFieldValue('end');
        var hsv = block.getFieldValue('color');

        // How many leds are used
        var amt = end-start;

        // Checks if an invalid length got specified
        if(amt <= 0)
            return "error.The specified 'end'-value is eiter the 'start'-value or below the 'start'-value.";

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
            this.appendDummyInput()
                .appendField("Color led")
                .appendField(new Blockly.FieldNumber(0, 0), "led")
                .appendField("in")
                .appendField(new FieldCustomColor(), "color")
                .appendField(".");
            this.setColour(230);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
        }
    };

    Blockly.JavaScript['sle_simple_single_color'] = function(block:any) {
        // Gets the color as an rgb-value
        var hsv = block.getFieldValue('color');

        // Assembles the config
        return packageBlockConfig({
            "name": "color",
            "config": {
                "start": block.getFieldValue('led'),      
                "rgb": HSV2HEX(hsv.h,hsv.s,hsv.v,true),
                "ledsPerStep": 1
            }
        });
    };
}


export default function registerColorBlocks(){
    registerSingleLed();
    registerGeneralColor();
    registerStripe();

}