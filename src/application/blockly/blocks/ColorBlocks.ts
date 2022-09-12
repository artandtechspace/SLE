import { ColorModule, ColorModuleConfig } from "../../defaultModules/ColorModule.js";
import { BlockError } from "../../errorSystem/Errors.js";
import { ConfigBuilder } from "../../ConfigBuilder.js";
import { Min, PositiveNumber, RGB, RGBNumber } from "../../types/Types.js";
import { getNumberFromSettingsUI, getParametricNumberMin, getRGBFromCode, getValueFromSettingsUI } from "../util/BlocklyBlockUtils.js";
import FieldCustomColor from "../fields/FieldCustomColor.js";
import { TB_COLOR_COLOR } from "../util/Toolbox.js";
import { getEnvironment } from "../../SharedObjects.js";
import { AnimationDirection, BBConsts } from "../util/BlocklyBlockConstants.js";
import { SystemParams } from "../../parameterCalculator/system/internal/ParameterSystemModel.js";
import { createBlocklyStyle } from "../util/BlocklyStyleBuilder.js";

const Blockly = require("blockly");

/**
 * Registers all blocks that are using the color-module
 */


export default function registerColorBlocks(){
    registerSingleLed('sle_simple_single_color');
    registerStripe('sle_simple_stripe_color');
    registerTurnoff("sle_simple_turnoff_color");
}

//#region BlockRegister

// Turn off all leds-block
function registerTurnoff(name: string){
    createBlocklyStyle(TB_COLOR_COLOR)
        .withText("debug.Turn off all leds")
    .register(name);


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
    const getDirection = "direction";
    const getTime = "time";

    createBlocklyStyle(TB_COLOR_COLOR)
        .withText("debug.Color leds")
        .withTextfield(getLedStart, "0")
        .withText("debug.to")
        .withTextfield(getLedEnd, SystemParams.LED_AMOUNT)
        .withText("debug.in")
        .withFieldCustomColor(getColor)
        .withCustomUi()
            .addText("Play the animation ")
            .addDropdown(getDirection, BBConsts.Direction_UI)
            .addText(".")
            .addInfoIcon("Plays the animation eigther forward or in reverse.")
            .breakLine()
            
            .addText("The animation takes")
            .addNumericField(getTime, 0)
            .hasMin(0)
            .andThen()
            .addText("ms to finish.")
            .addInfoIcon("How long the animation will play out in milliseconds.")
        .endCustomUi()
    .register(name);

    ConfigBuilder.registerModuleBlock<ColorModuleConfig>(name, function(block:any) {
        const pos1: PositiveNumber = getParametricNumberMin(block, getLedStart, 0, false);
        const pos2: PositiveNumber = getParametricNumberMin(block, getLedEnd, 0, false);
        const color: RGB = getRGBFromCode(block,getColor);
        const timeToFinish = getNumberFromSettingsUI(block, getTime) as PositiveNumber;
        const isReversed = getValueFromSettingsUI<string>(block, getDirection);

        // Checks if an invalid length got specified
        if(pos1 === pos2)
            throw new BlockError(block, "blocks.errors.color.startend");
        
        // Gets the start
        var start = Math.min(pos1,pos2) as PositiveNumber;
        
        // How many leds are used
        var amt: Min<1> = Math.max(pos1,pos2)-start as Min<1>;
        
        // How long one led takes to lighten up
        var delayPerLed: PositiveNumber = Math.round(timeToFinish/amt) as PositiveNumber;

        return {
            module: ColorModule,
            config: {
                ...ColorModule.DEFAULT_CONFIG,
                start,
                ledsPerStep: amt,
                clr_r: color.r,
                clr_g: color.g,
                clr_b: color.b,
                reversed: isReversed === AnimationDirection.REVERSE,
                delayPerLed: delayPerLed
            },
            block
        }
    });
}

// Single-led
function registerSingleLed(name: string){

    const getLed = "led";
    const getColor = "color";

    createBlocklyStyle(TB_COLOR_COLOR)
        .withText("debug.Color led")
        .withTextfield(getLed, "0")
        .withText("debug.in")
        .withFieldCustomColor(getColor)
    .register(name);

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