import { ConfigBuilder } from "../../ConfigBuilder";
import { GradientModule, GradientModuleConfig } from "../../defaultModules/animations/GradientModule";
import { RainbowModule, RainbowModuleConfig } from "../../defaultModules/animations/RainbowModule";
import { HSV, Min, PositiveNumber, Range } from "../../types/Types";
import { getValueFromSettingsUI } from "../util/BlocklyBlockUtils";
import { TB_COLOR_ANIMATIONS } from "../util/Toolbox";
import { FadeModule, FadeModuleConfig } from "../../defaultModules/animations/FadeModule";
import { SystemParams } from "../../parameterCalculator/system/internal/ParameterSystemModel";
import { createBlocklyStyle } from "../util/BlocklyStyleBuilder";
import { Language } from "../../language/LanguageManager";

const Blockly = require("blockly");


/**
 * Registers all blockly-blocks that are used for animations
 */

const LANGUAGE_BASE = "ui.blockly.block.animation";

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
    createBlocklyStyle(TB_COLOR_ANIMATIONS, `${LANGUAGE_BASE}.fade`)
        .withFieldCustomColor(getColorFrom, .3, .8, 1)
        .withFieldCustomColor(getColorTo, .75, .8, 1)
        .withCustomUi()
            // Fade for $$ ms
            .addNumericField(getAnimationLength, 5000).hasMin(0).andThen()
            .addInfoIcon(".ui.length.info")
            .breakLine(".ui.length")

            // from led $$ over $$ leds.
            .addNumericField(getLedFrom, 0).hasMin(0).andThen()
            .addNumericField(getLedLength,SystemParams.LED_AMOUNT).hasMin(1).andThen()
            .addInfoIcon(".ui.over.info")
            .breakLine(".ui.over")

            // It takes $$ ms, until one fade-cycle is finished.
            .addNumericField(getFadeLength, 5000).hasMin(100).andThen()
            .addInfoIcon(".ui.cycle.info")
            .breakLine(".ui.cycle")

            // Every led has an offset of $$ ms from the previous led.
            .addNumericField(getLedOffset, 50).hasMin(0).andThen()
            .addInfoIcon(".ui.offset.info")
            .breakLine(".ui.offset.info")
        .endCustomUi()
    .register(name);

    ConfigBuilder.registerModuleBlock<FadeModuleConfig>(name, function(block:any) { 
        var from: HSV = block.getFieldValue(getColorFrom);
        var to: HSV = block.getFieldValue(getColorTo);
        var ledfrom: PositiveNumber = getValueFromSettingsUI(block,getLedFrom) as PositiveNumber;
        var ledlength: Min<1> = getValueFromSettingsUI(block,getLedLength) as Min<1>;
        var ledoffset: PositiveNumber = getValueFromSettingsUI(block,getLedOffset) as PositiveNumber;
        var animLen: PositiveNumber = getValueFromSettingsUI(block,getAnimationLength) as PositiveNumber;
        var playlen: PositiveNumber = getValueFromSettingsUI(block,getFadeLength) as PositiveNumber;

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
    createBlocklyStyle(TB_COLOR_ANIMATIONS, `${LANGUAGE_BASE}.rainbow_calc`)
        .withFieldBrightness(getBrightness)
        .withCustomUi()
            // The Animation starts from led $$ and runs for $$ leds,
            .addNumericField(getLedFrom,0).hasMin(0).andThen()
            .addNumericField(getLedLength,SystemParams.LED_AMOUNT).hasMin(0).andThen()
            .addInfoIcon(".ui.start.info")
            .breakLine(".ui.start")

            // for $$ ms
            .addNumericField(getAnimationLength,5000).hasMin(100).andThen()
            .addInfoIcon(".ui.length.info")
            .breakLine(".ui.length")

            // It takes $$ ms for the rainbow to conclude one cycle.
            .addNumericField(getRepeatLength, 5000).hasMin(500).andThen()
            .addInfoIcon(".ui.repeat.info")
            .breakLine(".ui.repeat")
        .endCustomUi()
    .register(name);

    ConfigBuilder.registerModuleBlock<RainbowModuleConfig>(name, function(block:any) { 
        var ledFrom: PositiveNumber = getValueFromSettingsUI(block, getLedFrom) as PositiveNumber;
        var ledLength: Min<1> = getValueFromSettingsUI(block,getLedLength) as Min<1>;
        var playLenght: PositiveNumber = getValueFromSettingsUI(block, getAnimationLength) as PositiveNumber;
        var repeatLength: Min<500> = getValueFromSettingsUI(block, getRepeatLength) as Min<500>;
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
    createBlocklyStyle(TB_COLOR_ANIMATIONS, `${LANGUAGE_BASE}.rainbow`)
        .withFieldBrightness(getBrightness)
        .withCustomUi()
            // Create a Rainbow for $$ ms.
            .addNumericField(getAnimationLength,5000).hasMin(100).andThen()
            .addInfoIcon(".ui.length.info")
            .breakLine(".ui.length")

            // Start from led $$ and draw $$ leds.
            .addNumericField(getLedFrom,0).hasMin(0).andThen()
            .addNumericField(getLedLength,SystemParams.LED_AMOUNT).hasMin(0).andThen()
            .addInfoIcon(".ui.where.info")
            .breakLine(".ui.where")

            // Every led is offset by $$ ms from the previous one.
            .addNumericField(getLedOffset,-500).andThen()
            .addInfoIcon(".ui.offset.info")
            .breakLine(".ui.offset")

            // It takes $$ ms for the rainbow to conclude one cycle.
            .addNumericField(getRepeatLength, 5000).hasMin(500).andThen()
            .addInfoIcon(".ui.repeat.info")
            .breakLine(".ui.repeat")
        .endCustomUi()
    .register(name);

    ConfigBuilder.registerModuleBlock<RainbowModuleConfig>(name, function(block:any) { 
        var ledFrom: PositiveNumber = getValueFromSettingsUI(block, getLedFrom) as PositiveNumber;
        var ledLength: Min<1> = getValueFromSettingsUI(block,getLedLength) as Min<1>;
        var offsetPerLed: number = getValueFromSettingsUI(block, getLedOffset);
        var playLenght: PositiveNumber = getValueFromSettingsUI(block, getAnimationLength) as PositiveNumber;
        var repeatLength: Min<500> = getValueFromSettingsUI(block, getRepeatLength) as Min<500>;
        
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
    createBlocklyStyle(TB_COLOR_ANIMATIONS, `${LANGUAGE_BASE}.gradient`)
        .withFieldCustomColor(getColorFrom)
        .withFieldCustomColor(getColorTo, 0.1, 1, 1)
        .withFieldDropdown(getMode, {
            [MODUS_NORMAL]:             ".mode.normal",
            [MODUS_REVERSE_COLOR]:      ".mode.reverse_color",
            [MODUS_REVERSE_DIRECTION]:  ".mode.reverse_direction",
            [MODUS_BOTH]:               ".mode.reverse_both",
        })
        .withCustomUi()
            // Gradient from led $$ over $$ leds.
            .addNumericField(getLedFrom,0).hasMin(0).andThen()
            .addNumericField(getLedLength,SystemParams.LED_AMOUNT).hasMin(1).andThen()
            .addInfoIcon(".ui.where.info")
            .breakLine(".ui.where")

            // Wait $$ ms between turning on leds.
            .addNumericField(getLedDelay,100).hasMin(0).andThen()
            .addInfoIcon(".ui.wait.info")
            .breakLine(".ui.wait")
        .endCustomUi()
    .register(name);

    ConfigBuilder.registerModuleBlock<GradientModuleConfig>(name, function(block:any) { 
        var start: PositiveNumber = getValueFromSettingsUI(block,getLedFrom) as PositiveNumber;
        var length: Min<1> = getValueFromSettingsUI(block,getLedLength) as Min<1>;
        var colorFrom: HSV = block.getFieldValue(getColorFrom);
        var colorTo: HSV = block.getFieldValue(getColorTo);
        var delay: PositiveNumber = getValueFromSettingsUI(block,getLedDelay) as PositiveNumber;
    
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