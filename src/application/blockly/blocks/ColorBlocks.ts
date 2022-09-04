import { ColorModule, ColorModuleConfig, StepMode } from "../../defaultModules/ColorModule.js";
import { BlockError } from "../../errorSystem/Errors.js";
import { ConfigBuilder } from "../../ConfigBuilder.js";
import { Min, PositiveNumber, RGB, RGBNumber } from "../../types/Types.js";
import { getParametricNumber, getParametricNumberMin, getRGBFromCode } from "../util/BlocklyBlockUtils.js";
import FieldCustomColor from "../fields/FieldCustomColor.js";
import { TB_COLOR_COLOR } from "../util/Toolbox.js";
import { getEnvironment } from "../../SharedObjects.js";

const Blockly = require("blockly");

/**
 * Registers all blocks that are using the color-module
 */


export default function registerColorBlocks(){
    registerSingleLed('sle_simple_single_color');
    registerStripe('sle_simple_stripe_color');
    registerTurnoff("sle_simple_turnoff_color");
    // TODO: Remove debug-block
    registerDebug("sle_color_debug");
}

//#region BlockRegister


// Colors multiple leds in a row
function registerDebug(name: string){

    const getColor = "color";
    const getReversed = "reversed";

    Blockly.Blocks[name] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Color:")
                .appendField(new FieldCustomColor(), getColor)
                .appendField("Reversed: ")
                .appendField(new Blockly.FieldCheckbox("TRUE"), getReversed)
                .appendField("Steps: ")
                .appendField(new Blockly.FieldNumber(1, 1), "steps")
                .appendField("Space: ")
                .appendField(new Blockly.FieldNumber(1, 1), "space")
                .appendField("Leds per step: ")
                .appendField(new Blockly.FieldNumber(1, 1), "perStep")
                .appendField("Start: ")
                .appendField(new Blockly.FieldNumber(1, 0), "start")

            this.setColour(TB_COLOR_COLOR);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setInputsInline(true);
        }
    };

    ConfigBuilder.registerModuleBlock<ColorModuleConfig>(name, function(block:any) {
        var color: RGB = getRGBFromCode(block,getColor);
        
        
        return {
            module: ColorModule,
            config: {
                ...ColorModule.DEFAULT_CONFIG,
                start: block.getFieldValue("start") as PositiveNumber,
                ledsPerStep: block.getFieldValue("perStep") as Min<1>,
                clr_r: color.r,
                clr_g: color.g,
                clr_b: color.b,
                reversed: (block.getFieldValue(getReversed) === "TRUE") as boolean,
                delayAfterStep: 50 as PositiveNumber,
                delayPerLed: 50 as PositiveNumber,
                steps: block.getFieldValue("steps") as Min<1>,
                space: block.getFieldValue("space") as PositiveNumber
            },
            block
        }
    });
}

// Turn off all leds-block
function registerTurnoff(name: string){
    Blockly.Blocks[name] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Turn off all leds");

            this.setColour(TB_COLOR_COLOR);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setInputsInline(true);
        }
    };


    ConfigBuilder.registerModuleBlock<ColorModuleConfig>(name, function(block:any) {                
        return {
            module: ColorModule,
            config: {
                ...ColorModule.DEFAULT_CONFIG,
                start: 0 as PositiveNumber,
                ledsPerStep: getEnvironment().ledAmount as Min<1>,
                clr_r: 0 as RGBNumber,
                clr_g: 0 as RGBNumber,
                clr_b: 0 as RGBNumber
            },
            block
        }
    });
}

// Colors multiple leds in a row
function registerStripe(name: string){

    const getLedStart = "ledstart";
    const getLedEnd = "ledend";
    const getColor = "color";

    Blockly.Blocks[name] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Color leds")
                .appendField(new Blockly.FieldNumber(0, 0), getLedStart)
                .appendField("to")
                .appendField(new Blockly.FieldNumber(32, 1), getLedEnd)
                .appendField("in")
                .appendField(new FieldCustomColor(), getColor)

            this.setColour(TB_COLOR_COLOR);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setInputsInline(true);
        }
    };

    ConfigBuilder.registerModuleBlock<ColorModuleConfig>(name, function(block:any) {
        var pos1: PositiveNumber = block.getFieldValue(getLedStart);
        var pos2: PositiveNumber = block.getFieldValue(getLedEnd);
        var color: RGB = getRGBFromCode(block,getColor);
        
        // Checks if an invalid length got specified
        if(pos1 === pos2)
            throw new BlockError(block, "blocks.errors.color.startend");
        
        // Gets the start
        var start = Math.min(pos1,pos2) as PositiveNumber;
        
        // How many leds are used
        var amt: Min<1> = Math.max(pos1,pos2)-start as Min<1>;
        
        return {
            module: ColorModule,
            config: {
                ...ColorModule.DEFAULT_CONFIG,
                start,
                ledsPerStep: amt,
                clr_r: color.r,
                clr_g: color.g,
                clr_b: color.b
            },
            block
        }
    });
}

// Single-led
function registerSingleLed(name: string){

    const getLed = "led";
    const getColor = "color";

    Blockly.Blocks[name] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Color led")
                .appendField(new Blockly.FieldTextInput("default"), getLed)
                .appendField("in")
                .appendField(new FieldCustomColor(), getColor);
            this.setColour(TB_COLOR_COLOR);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setInputsInline(true);
        }
    };

    ConfigBuilder.registerModuleBlock<ColorModuleConfig>(name, function(block:any) {
        // Start
        //var start: PositiveNumber = block.getFieldValue(getLed);
        var start: Min<0> = getParametricNumberMin(block, getLed, 0, false);

        // Color
        var color: RGB = getRGBFromCode(block,getColor);

        return {
            module: ColorModule,
            config:{
                ...ColorModule.DEFAULT_CONFIG,
                start,
                clr_r: color.r,
                clr_g: color.g,
                clr_b: color.b
            },
            block
        }
    });
}

//#endregion