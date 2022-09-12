import { ConfigBuilder } from "../../ConfigBuilder.js";
import { GradientModule, GradientModuleConfig } from "../../defaultModules/animations/GradientModule.js";
import { RainbowModule, RainbowModuleConfig } from "../../defaultModules/animations/RainbowModule.js";
import { HSV, Min, PositiveNumber, Range } from "../../types/Types.js";
import { getNumberFromSettingsUI } from "../util/BlocklyBlockUtils.js";
import { TB_COLOR_ANIMATIONS } from "../util/Toolbox.js";
import { FadeModule, FadeModuleConfig } from "../../defaultModules/animations/FadeModule.js";
import { SystemParams } from "../../parameterCalculator/system/internal/ParameterSystemModel.js";
import { createBlocklyStyle } from "../util/BlocklyStyleBuilder.js";

const Blockly = require("blockly");


/**
 * Registers all blockly-blocks that are used for animations
 */

const LANGUAGE_BASE = "ui.blockly.block.animation.";

export default function registerAnimationBlocks(){
    registerGradientBlock('sle_animation_gradient');
    registerRainbowBlock('sle_animation_rainbow');
    registerRainbowAutocalcBlock("sle_animation_rainbow_autocalc");
    registerFadeBlock('sle_animation_fade');
}

//#region BlockRegister

// Fade-animation
function registerFadeBlock(name: string){
    // Names for the variables
    const getAnimationLength = "amtLen";
    const getLedFrom = "ledFrom";
    const getLedLength = "ledLength";
    const getFadeLength = "fadeLen";
    const getLedOffset = "ledOffset";
    const getColorFrom = "clrFrom";
    const getColorTo = "clrTo";

    // Fade between $$ and $$
    createBlocklyStyle(TB_COLOR_ANIMATIONS)
        .withFieldCustomColor(getColorFrom, .3, .8, 1)
        .withFieldCustomColor(getColorTo, .75, .8, 1)
        .withCustomUi()
            .addText("Fade for")
            .addNumericField(getAnimationLength, 5000).hasMin(0).andThen()
            .addText("ms")
            .addInfoIcon("How long the animation will play before moving on to the next block.")
            .breakLine()

            .addText("from led")
            .addNumericField(getLedFrom, 0).hasMin(0).andThen()
            .addText("over")
            .addNumericField(getLedLength,SystemParams.LED_AMOUNT).hasMin(1).andThen()
            .addText("leds.")
            .addInfoIcon("Specify the animation's starting led and led-length.")
            .breakLine()

            .addText("It takes")
            .addNumericField(getFadeLength, 5000).hasMin(100).andThen()
            .addText("ms, until one fade-cycle is finished.")
            .addInfoIcon("How long one fade-cycle takes.")
            .breakLine()

            .addText("Every led has an offset of")
            .addNumericField(getLedOffset, 50).hasMin(0).andThen()
            .addText("ms from the previous led.")
            .addInfoIcon("Use this to create flow through the stripe.")
        .endCustomUi()
    .register(name, LANGUAGE_BASE+"fade");

    ConfigBuilder.registerModuleBlock<FadeModuleConfig>(name, function(block:any) { 
        var from: HSV = block.getFieldValue(getColorFrom);
        var to: HSV = block.getFieldValue(getColorTo);
        var ledfrom: PositiveNumber = getNumberFromSettingsUI(block,getLedFrom) as PositiveNumber;
        var ledlength: Min<1> = getNumberFromSettingsUI(block,getLedLength) as Min<1>;
        var ledoffset: PositiveNumber = getNumberFromSettingsUI(block,getLedOffset) as PositiveNumber;
        var animLen: PositiveNumber = getNumberFromSettingsUI(block,getAnimationLength) as PositiveNumber;
        var playlen: PositiveNumber = getNumberFromSettingsUI(block,getFadeLength) as PositiveNumber;

        return {
            module: FadeModule,
            config: {
                ...FadeModule.DEFAULT_CONFIG,
                color_frm_h: from.h,
                color_frm_s: from.s,
                color_frm_v: from.v,
                color_to_h: to.h,
                color_to_s: to.s,
                color_to_v: to.v,
                ledFrom: ledfrom,
                ledLength: ledlength,
                offsetPerLedInMs: ledoffset,
                playLengthInMs: animLen,
                repeatLengthInMs: playlen
            },
            block
        }
    });
}


// Rainbow-block auto-calculate offset per led
function registerRainbowAutocalcBlock(name: string){
    const getLedFrom = "ledFrom";
    const getLedLength = "ledLength";
    const getAnimationLength = "anmLength";
    const getRepeatLength = "repLength";
    const getBrightness = "bright";

    // Rainbow with a brightness of $$
    createBlocklyStyle(TB_COLOR_ANIMATIONS)
        .withFieldBrightness(getBrightness)
        .withCustomUi()
            .addText("The Animation starts from led")
            .addNumericField(getLedFrom,0).hasMin(0).andThen()
            .addText("and runs for")
            .addNumericField(getLedLength,SystemParams.LED_AMOUNT).hasMin(0).andThen()
            .addText("leds,")
            .addInfoIcon("Specify the animation's starting led and led-length.")
            .breakLine()

            .addText("for")
            .addNumericField(getAnimationLength,5000).hasMin(100).andThen()
            .addText("ms.")
            .addInfoIcon("How long the Rainbow is shown before moving to the next block.")
            .breakLine()

            .addText("It takes")
            .addNumericField(getRepeatLength, 5000).hasMin(500).andThen()
            .addText("ms for the rainbow to conclude one cycle.")
            .addInfoIcon("How long it takes for the rainbow to cycle around once.")
        .endCustomUi()
    .register(name, LANGUAGE_BASE+"rainbow_calc");

    ConfigBuilder.registerModuleBlock<RainbowModuleConfig>(name, function(block:any) { 
        var ledFrom: PositiveNumber = getNumberFromSettingsUI(block, getLedFrom) as PositiveNumber;
        var ledLength: Min<1> = getNumberFromSettingsUI(block,getLedLength) as Min<1>;
        var playLenght: PositiveNumber = getNumberFromSettingsUI(block, getAnimationLength) as PositiveNumber;
        var repeatLength: Min<500> = getNumberFromSettingsUI(block, getRepeatLength) as Min<500>;
        var offsetPerLed: number = Math.round(repeatLength/ledLength);
        
        var brightness: number = block.getFieldValue(getBrightness);
    
        return {
            module: RainbowModule,
            config: {
                ...RainbowModule.DEFAULT_CONFIG,
                ledFrom: ledFrom,
                ledLength: ledLength,
                offsetPerLedInMs: offsetPerLed,
                playLengthInMs: playLenght,
                repeatLengthInMs: repeatLength,
                value: brightness * 255 as Range<0,255>,
            },
            block
        }
    });
}

// Rainbow-block
function registerRainbowBlock(name: string){

    const getLedFrom = "ledFrom";
    const getLedLength = "ledLength";
    const getLedOffset = "ledoffset";
    const getAnimationLength = "anmLength";
    const getRepeatLength = "repLength";
    const getBrightness = "bright";

    // Rainbow with a brightness of $$ (Led-offset)
    createBlocklyStyle(TB_COLOR_ANIMATIONS)
        .withFieldBrightness(getBrightness)
        .withCustomUi()
            .addText("Create a Rainbow for")
            .addNumericField(getAnimationLength,5000).hasMin(100).andThen()
            .addText("ms.")
            .addInfoIcon("How long the Rainbow is shown before moving to the next block.")
            .breakLine()

            .addText("Start from led")
            .addNumericField(getLedFrom,0).hasMin(0).andThen()
            .addText("and draw")
            .addNumericField(getLedLength,SystemParams.LED_AMOUNT).hasMin(0).andThen()
            .addText("leds.")
            .addInfoIcon("Specify the animation's starting led and led-length.")
            .breakLine()

            .addText("Every led is offset by")
            .addNumericField(getLedOffset,-500).andThen()
            .addText("ms from the previous led.")
            .addInfoIcon("Use this to create flow through the stripe.")
            .breakLine()

            .addText("It takes")
            .addNumericField(getRepeatLength, 5000).hasMin(500).andThen()
            .addText("ms for the rainbow to conclude one cycle.")
            .addInfoIcon("How long it takes for the rainbow to cycle around once.")
        .endCustomUi()
    .register(name, LANGUAGE_BASE+"rainbow");

    ConfigBuilder.registerModuleBlock<RainbowModuleConfig>(name, function(block:any) { 
        var ledFrom: PositiveNumber = getNumberFromSettingsUI(block, getLedFrom) as PositiveNumber;
        var ledLength: Min<1> = getNumberFromSettingsUI(block,getLedLength) as Min<1>;
        var offsetPerLed: number = getNumberFromSettingsUI(block, getLedOffset);
        var playLenght: PositiveNumber = getNumberFromSettingsUI(block, getAnimationLength) as PositiveNumber;
        var repeatLength: Min<500> = getNumberFromSettingsUI(block, getRepeatLength) as Min<500>;
        
        var brightness: number = block.getFieldValue(getBrightness);
    
        return {
            module: RainbowModule,
            config: {
                ...RainbowModule.DEFAULT_CONFIG,
                ledFrom: ledFrom,
                ledLength: ledLength,
                offsetPerLedInMs: offsetPerLed,
                playLengthInMs: playLenght,
                repeatLengthInMs: repeatLength,
                value: brightness * 255 as Range<0,255>,
            },
            block
        }
    });

}

// Gradient-block with all features
function registerGradientBlock(name: string){

    const MODUS_NORMAL            = "normal";
    const MODUS_REVERSE_DIRECTION = "rev_dir";
    const MODUS_REVERSE_COLOR     = "rev_col";
    const MODUS_BOTH              = "both";

    const getMode = "mode";
    const getLedFrom = "ledfrom";
    const getLedLength = "ledlength";
    const getLedDelay = "leddelay";
    const getColorFrom = "colorfrom";
    const getColorTo = "colorto";

    // Gradient from $$ to $$ with mode $$
    createBlocklyStyle(TB_COLOR_ANIMATIONS)
        .withFieldCustomColor(getColorFrom)
        .withFieldCustomColor(getColorTo, 0.1, 1, 1)
        .withFieldDropdown(getMode, {
            [MODUS_NORMAL]:             LANGUAGE_BASE+"gradient.mode.normal",
            [MODUS_REVERSE_COLOR]:      LANGUAGE_BASE+"gradient.mode.reverse_color",
            [MODUS_REVERSE_DIRECTION]:  LANGUAGE_BASE+"gradient.mode.reverse_direction",
            [MODUS_BOTH]:               LANGUAGE_BASE+"gradient.mode.reverse_both",
        })
        .withCustomUi()
            .addText("Gradient from led")
            .addNumericField(getLedFrom,0).hasMin(0).andThen()
            .addText("over")
            .addNumericField(getLedLength,SystemParams.LED_AMOUNT).hasMin(1).andThen()
            .addText("leds.")
            .addInfoIcon("Specify the animation's starting led and led-length.")
            .breakLine()

            .addText("Wait")
            .addNumericField(getLedDelay,100).hasMin(0).andThen()
            .addText("ms between turning on leds.")
            .addInfoIcon("This waits a given amount of time before turning the next led on.")
        .endCustomUi()
    .register(name, LANGUAGE_BASE+"gradient");

    ConfigBuilder.registerModuleBlock<GradientModuleConfig>(name, function(block:any) { 
        var start: PositiveNumber = getNumberFromSettingsUI(block,getLedFrom) as PositiveNumber;
        var length: Min<1> = getNumberFromSettingsUI(block,getLedLength) as Min<1>;
        var colorFrom: HSV = block.getFieldValue(getColorFrom);
        var colorTo: HSV = block.getFieldValue(getColorTo);
        var delay: PositiveNumber = getNumberFromSettingsUI(block,getLedDelay) as PositiveNumber;
    
        // Selected modus
        var modus:string = block.getFieldValue(getMode);

        var reversedDirection = modus === MODUS_BOTH || modus === MODUS_REVERSE_DIRECTION;
        var reversedColor     = modus === MODUS_BOTH || modus === MODUS_REVERSE_COLOR;

        return {
            module: GradientModule,
            config: {
                color_frm_h: colorFrom.h,
                color_frm_s: colorFrom.s,
                color_frm_v: colorFrom.v,

                color_to_h: colorTo.h,
                color_to_s: colorTo.s,
                color_to_v: colorTo.v,

                delayPerLed: delay,
                ledFrom: start,
                ledLength: length,
                directionReversed: reversedDirection,
                colorReversed: reversedColor
            },
            block
        }
    });
}

//#endregion