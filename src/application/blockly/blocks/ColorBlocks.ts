import { ColorModule, ColorModuleConfig } from "../../defaultModules/ColorModule.js";
import { Environment } from "../../Environment.js";
import { BlockError } from "../../errorSystem/Error.js";
import { ConfigBuilder } from "../../ConfigBuilder.js";
import { HexColor, isMin, Min, PositiveNumber } from "../../types/Types.js";
import { getHexFromCode, getNumberFromCode, getNumberFromCodeAsMin } from "../BlocklyUtils.js";
import FieldCustomColor from "../fields/FieldCustomColor.js";

const Blockly = require("blockly");

/**
 * This file registers all blocks that are using the color-module. Eg. generate configs for it
 */


export default function registerColorBlocks(){
    registerSingleLed('sle_simple_single_color');
    registerStripe('sle_simple_stripe_color');
    registerStepsColor('sle_steps_color');

}



// General color module with spaces between leds
function registerStepsColor(name: string){
    Blockly.Blocks[name] = {
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

    ConfigBuilder.registerModuleBlock<ColorModuleConfig>(name, function(block:any, env: Environment) {
        // Variables
        var start: PositiveNumber = getNumberFromCodeAsMin(block,"start", 0);
        var steps: Min<1> = getNumberFromCodeAsMin(block,"steps", 1);

        // How many leds to skip between steps
        var skipLen: Min<1> = getNumberFromCodeAsMin(block,"space-between-steps", 1);

        // How long each step is
        var skipStart: Min<1> = getNumberFromCodeAsMin(block,"step-length", 1);

        // Gets the color
        var color: HexColor = getHexFromCode(block,"color");

        // Assembles the config
        return {
            module: ColorModule,
            config: {
                ...ColorModule.DEFAULT_CONFIG,
                start,
                ledsPerStep: skipStart,
                rgbHex: color,
                space: skipLen as any as PositiveNumber,
                steps
            }
        }
    });
}

// Colors multiple leds in a row
function registerStripe(name: string){
    Blockly.Blocks[name] = {
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

    ConfigBuilder.registerModuleBlock<ColorModuleConfig>(name, function(block:any, env: Environment) {
        var start: PositiveNumber = getNumberFromCodeAsMin(block,"start", 0);
        var end: number = getNumberFromCode(block,"end");
        var color: HexColor = getHexFromCode(block,"color");

        // How many leds are used
        var amt: number = end-start;

        // Checks if an invalid length got specified
        if(!isMin(amt,1))
            throw new BlockError("The specified 'end'-value is eiter the 'start'-value or below the 'start'-value.", block);

        return {
            module: ColorModule,
            config: {
                ...ColorModule.DEFAULT_CONFIG,
                start,
                ledsPerStep: amt,
                rgbHex: color
            }
        }
    });
}

// Single-led
function registerSingleLed(name: string){
    Blockly.Blocks[name] = {
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

    ConfigBuilder.registerModuleBlock<ColorModuleConfig>(name, function(block:any, env: Environment) {
        // Start
        var start: PositiveNumber = getNumberFromCodeAsMin(block,"led",0);

        // Color
        var color: HexColor = getHexFromCode(block,"color");

        return {
            module: ColorModule,
            config:{
                ...ColorModule.DEFAULT_CONFIG,
                start,
                rgbHex: color
            }
            
        }
    });
}