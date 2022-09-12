import { ConfigBuilder } from "../../ConfigBuilder.js";
import { HSV, Min, OpenObject, PositiveNumber, Range, RGB, RGBNumber } from "../../types/Types.js";
import { getNumberFromSettingsUI, getParametricNumberMin, getRGBFromCode, getValueFromSettingsUI } from "../util/BlocklyBlockUtils.js";
import { TB_COLOR_GOGGLES } from "../util/Toolbox.js";
import { FadeModule, FadeModuleConfig } from "../../defaultModules/animations/FadeModule.js";
import { getEnvironment } from "../../SharedObjects.js";
import { ColorModule, ColorModuleConfig, StepMode } from "../../defaultModules/ColorModule.js";
import { AnimationDirection, BBConsts } from "../util/BlocklyBlockConstants.js";
import { GradientModule, GradientModuleConfig } from "../../defaultModules/animations/GradientModule.js";
import { RainbowModule, RainbowModuleConfig } from "../../defaultModules/animations/RainbowModule.js";
import { createBlocklyStyle } from "../util/BlocklyStyleBuilder.js";

// For dropdown-select's using lenses
enum LenseType {
    RIGHT= "right",
    LEFT= "left",
    BOTH= "both",
    BOTH_PARALLEL = "both_paral"
};

/**
 * Registers all blockly-blocks that are used for animations
 */

const LANGUAGE_BASE = "ui.blockly.block.goggles.";

export default function registerGoogleBlocks(){
    registerTurnOff("sle_goggles_turnoff");
    registerColorBlock('sle_goggles_color');
    registerColorOnlyLense('sle_goggles_color_lense');
    registerFade("sle_goggles_fade");
    registerGradient("sle_goggles_gradient");
    registerRainbow("sle_goggles_rainbow");
}


//#region Util-functions

const LenseDropdown = {
    [LenseType.RIGHT]: ".right",
    [LenseType.LEFT]: ".left",
    [LenseType.BOTH]: ".both"
};

const LenseDropdownWithParallel = {
    ...LenseDropdown,
    [LenseType.BOTH_PARALLEL]: ".both_parallel"
}

// Calculates based on the given lense and starting index on that lense the starting point and length
function getStartAndLengthFromLense(lense: LenseType, startIdx: number = 0){
    // Current amount of leds
    const ledAmt = getEnvironment().ledAmount;

    // Half of the led amount
    var halfledAmt = Math.floor(ledAmt/2);

    return {
        // From which led the coloring starts
        from: (lense === LenseType.LEFT ? halfledAmt : 0) + startIdx as PositiveNumber,
        
        // How many leds will be affected
        length: (lense === LenseType.BOTH ? ledAmt : halfledAmt) - startIdx as Min<1>
    }
}

//#endregion

//#region BlockRegister

// Turns off a specified lense
function registerTurnOff(name: string){
    // Names for the variables
    const getLense = "lense";

    // Turn off $$ lense(s)
    createBlocklyStyle(TB_COLOR_GOGGLES, LANGUAGE_BASE+"turnoff")
        .withFieldDropdown(getLense, LenseDropdown)
    .register(name);

    ConfigBuilder.registerModuleBlock<ColorModuleConfig>(name, function(block:any) {        
        // Which lense
        const lense: LenseType = block.getFieldValue(getLense);

        // Length and starting position
        var {from, length} = getStartAndLengthFromLense(lense);

        return {
            module: ColorModule,
            config: {
                ...ColorModule.DEFAULT_CONFIG,
                clr_r: 0 as RGBNumber,
                clr_g: 0 as RGBNumber,
                clr_b: 0 as RGBNumber,

                start: from as PositiveNumber,
                ledsPerStep: length as Min<1>
            },
            block
        }
    });
}


// Rainbow-Block
function registerRainbow(name: string){
    // Names for the variables
    const getLense = "lense";
    const getTime = "time";
    const getDirection = "direction";
    const getBrightness = "brightness";

    // Rainbow over $$ lense(s) with a brightness of $$ in $$ ms
    createBlocklyStyle(TB_COLOR_GOGGLES, LANGUAGE_BASE+"rainbow")
        .withFieldDropdown(getLense, LenseDropdown)
        .withFieldBrightness(getBrightness)
        .withTextfield(getTime, "1000")
        .withCustomUi()
            // The direction is $$.
            .addDropdown(getDirection, ".ui.direction", BBConsts.Direction_UI)
            .addInfoIcon(".ui.direction.info")
            .breakLine(".ui.direction")
        .endCustomUi()
    .register(name);

   
    ConfigBuilder.registerModuleBlock<RainbowModuleConfig>(name, function(block:any) {
        var brightness: number = block.getFieldValue(getBrightness);
        
        // Which lense
        const lense: LenseType = block.getFieldValue(getLense);

        // How long the animation shall play
        const playTime = getParametricNumberMin(block,getTime, 500, false);
        
        // Is the animation reversed
        const isReversed: boolean = getValueFromSettingsUI<string>(block, getDirection) === AnimationDirection.REVERSE;


        // Length and starting position
        var {from, length} = getStartAndLengthFromLense(lense);

        // If the lense is set to both, the delay is doubled to play the same animation on both lenses
        var lenseMulti = lense === LenseType.BOTH ? 2 : 1;

        // Calculates the delay per step/led
        var delay = (isReversed ? -1 : 1) * lenseMulti * Math.round(playTime/length) as PositiveNumber;

        return {
            module: RainbowModule,
            config: {
                ...RainbowModule.DEFAULT_CONFIG,
                ledFrom: from,
                ledLength: length,
                offsetPerLedInMs: delay,
                playLengthInMs: playTime as any as PositiveNumber,
                repeatLengthInMs: playTime,
                value: brightness * 255 as Range<0,255>
            },
            block
        }
    });
}

// Gradient-block
function registerGradient(name: string){
    // Names for the variables
    const getColorFrom = "colorfrm";
    const getColorTo = "colorto";
    const getLense = "lense";
    const getTime = "time";
    const getDirection = "direction";
    const getClrDir = "clrdir";


    // Gradient over $$ lense(s) from $$ to $$ in $$ ms
    createBlocklyStyle(TB_COLOR_GOGGLES, LANGUAGE_BASE+"gradient")
        .withFieldDropdown(getLense, LenseDropdown)
        .withFieldCustomColor(getColorFrom)
        .withFieldCustomColor(getColorTo, .4, 1, 1)
        .withTextfield(getTime, "1000")
        .withCustomUi()
            // The direction is $$.
            .addDropdown(getDirection, ".ui.direction", BBConsts.Direction_UI)
            .addInfoIcon(".ui.direction.info")
            .breakLine(".ui.direction")

            // The color is $$.
            .addText("")
            .addDropdown(getClrDir, ".ui.color", BBConsts.Direction_UI)
            .addText(".")
            .addInfoIcon(".ui.color.info")
            .breakLine(".ui.color")
        .endCustomUi()
    .register(name);

    ConfigBuilder.registerModuleBlock<GradientModuleConfig>(name, function(block:any) {
        // Colors to fade between
        var clrFrom: HSV = block.getFieldValue(getColorFrom);
        var clrTo: HSV = block.getFieldValue(getColorTo);
        
        // Which lense
        const lense: LenseType = block.getFieldValue(getLense);

        // How long the animation shall play
        const playTime: PositiveNumber = getParametricNumberMin(block,getTime, 200, false) as any as PositiveNumber;
        
        // Is the animation reversed
        const isReversed: boolean = getValueFromSettingsUI<string>(block, getDirection) === AnimationDirection.REVERSE;

        // Is the color reversed
        const isColorReversed: boolean = getValueFromSettingsUI<string>(block, getClrDir) === AnimationDirection.REVERSE;


        // Length and starting position
        var {from, length} = getStartAndLengthFromLense(lense);

        // If the lense is set to both, the delay is doubled to play the same animation on both lenses
        var lenseMulti = lense === LenseType.BOTH ? 2 : 1;

        // Calculates the delay per step/led
        var delay = Math.round(lenseMulti * playTime/length) as PositiveNumber;

        return {
            module: GradientModule,
            config: {
                ...GradientModule.DEFAULT_CONFIG,
                color_frm_h: clrFrom.h,
                color_frm_s: clrFrom.s,
                color_frm_v: clrFrom.v,
                color_to_h: clrTo.h,
                color_to_s: clrTo.s,
                color_to_v: clrTo.v,
                delayPerLed: delay,
                ledFrom: from,
                ledLength: length,
                directionReversed: isReversed,
                colorReversed: isColorReversed
            },
            block
        }
    });
}

// Fade-Block
function registerFade(name: string){
    // Names for the variables
    const getColorFrom = "colorfrm";
    const getColorTo = "colorto";
    const getLense = "lense";
    const getTime = "time";

    // Fade $$ from $$ to $$ in $$ ms
    createBlocklyStyle(TB_COLOR_GOGGLES, LANGUAGE_BASE+"fade")
        .withFieldDropdown(getLense, LenseDropdown)
        .withFieldCustomColor(getColorFrom)
        .withFieldCustomColor(getColorTo)
        .withTextfield(getTime, "1000")
    .register(name,);

    ConfigBuilder.registerModuleBlock<FadeModuleConfig>(name, function(block:any) {
        // Colors to fade between
        var clrFrom: HSV = block.getFieldValue(getColorFrom);
        var clrTo: HSV = block.getFieldValue(getColorTo);
        
        // Which lense
        const lense: LenseType = block.getFieldValue(getLense);

        // How long the animation shall play
        const playTime: PositiveNumber = getParametricNumberMin(block,getTime, 200, false) as any as PositiveNumber;
        
        // Length and starting position
        var {from, length} = getStartAndLengthFromLense(lense);

        // If the lense is set to both, the delay is doubled to play the same animation on both lenses
        var lenseMulti = lense === LenseType.BOTH ? 2 : 1;

        // Calculates the delay per step/led
        var delay = lenseMulti * Math.round(playTime/length) as PositiveNumber;

        return {
            module: FadeModule,
            config: {
                color_frm_h: clrFrom.h,
                color_frm_s: clrFrom.s,
                color_frm_v: clrFrom.v,
                color_to_h: clrTo.h,
                color_to_s: clrTo.s,
                color_to_v: clrTo.v,
                ledFrom: from,
                ledLength: length,
                offsetPerLedInMs: delay,
                playLengthInMs: playTime,
                repeatLengthInMs: playTime,
                updateRateInMs: 50 as Min<5>
            },
            block
        }
    });
}

// Colors one or both lenses in a given color
function registerColorOnlyLense(name: string){

    // Names for the variables
    const getColor = "color";
    const getLense = "lense";
    const getTime = "time";
    const getDirection = "direction";

    // Color $$ lense(s) in $$
    createBlocklyStyle(TB_COLOR_GOGGLES, LANGUAGE_BASE+"onlylense")
        .withFieldDropdown(getLense, LenseDropdownWithParallel)
        .withFieldCustomColor(getColor)
        .withCustomUi()
            // Play the animation $$.
            .addDropdown(getDirection, ".ui.direction", BBConsts.Direction_UI)
            .addInfoIcon(".ui.direction.info")
            .breakLine(".ui.direction")

            // The animation takes $$ ms to finish.
            .addNumericField(getTime, 0).hasMin(0).andThen()
            .addInfoIcon(".ui.time.info")
            .breakLine(".ui.time")
        .endCustomUi()
    .register(name);

    ConfigBuilder.registerModuleBlock<ColorModuleConfig>(name, function(block:any) {
        const color: RGB = getRGBFromCode(block, getColor);
        const lense: LenseType = block.getFieldValue(getLense);
        const isReversed: boolean = getValueFromSettingsUI<string>(block, getDirection) === AnimationDirection.REVERSE;
        const playTime: PositiveNumber = getValueFromSettingsUI(block, getTime)

        // Length and starting position
        var {from, length} = getStartAndLengthFromLense(lense);

        // Calculates the delay per step/led
        var delay = Math.round(playTime/length) as PositiveNumber;

        return {
            module: ColorModule,
            config: {
                delayAfterStep: 0 as PositiveNumber,
                delayPerLed: delay as PositiveNumber,
                ledsPerStep: length as Min<1>,
                space: 0 as PositiveNumber,
                start: from as PositiveNumber,
                steps: (lense === LenseType.BOTH_PARALLEL ? 2 : 1) as Min<1>,

                clr_r: color.r,
                clr_g: color.g,
                clr_b: color.b,

                modus: StepMode.PARALLEL,

                reversed: isReversed
            },
            block
        }
    });

}

// Color-Left-Right-Both-Google(s)
function registerColorBlock(name: string){
    // Names for the variables
    const getColor = "color";
    const getDropdownDesc = "every"
    const getLense = "lense";
    const getTime = "time";
    const getDirection = "direction";
    const getStartIndex = "start";

    // Generates the dropdown-options
    const nthOptions: OpenObject = {};
    for(var x = 2; x <= 8; x++)
        nthOptions[x] = ".count."+x;

    // Color every $$ led of $$ lense(s) with $$ in $$ ms
    createBlocklyStyle(TB_COLOR_GOGGLES, LANGUAGE_BASE+"color")
        .withFieldDropdown(getDropdownDesc, nthOptions)
        .withFieldDropdown(getLense, LenseDropdown)
        .withFieldCustomColor(getColor)
        .withTextfield(getTime, "1000")
        .withCustomUi()
            // Play the animation $$.
            .addDropdown(getDirection, ".ui.direction", BBConsts.Direction_UI)
            .addInfoIcon(".ui.direction.info")
            .breakLine(".ui.direction")

            // Start from led $$
            .addNumericField(getStartIndex, 0).hasMin(0).andThen()
            .breakLine(".ui.start")
        .endCustomUi()
    .register(name)

    ConfigBuilder.registerModuleBlock<ColorModuleConfig>(name, function(block:any) {
        const color: RGB = getRGBFromCode(block, getColor);
        const lense: LenseType = block.getFieldValue(getLense);
        const isReversed: boolean = getValueFromSettingsUI<string>(block, getDirection) === AnimationDirection.REVERSE;

        // How long the animation shall play
        const playTime: PositiveNumber = getParametricNumberMin(block,getTime, 0, false);

        // Color every nth led, this is n
        const placeEveryXLed: number = parseInt(block.getFieldValue(getDropdownDesc));
        // From where to start coloring
        const startIdx: PositiveNumber = getNumberFromSettingsUI(block, getStartIndex) as Min<0>;

        // Length and starting position
        var {from, length} = getStartAndLengthFromLense(lense, startIdx);

        // Calculates the amount of steps required
        var steps = Math.ceil(length/((placeEveryXLed))) as Min<1>;

        // Calculates the delay per step/led
        var delay = Math.round(playTime/steps) as PositiveNumber;

        return {
            module: ColorModule,
            config: {
                delayAfterStep: 0 as PositiveNumber,
                delayPerLed: delay,
                ledsPerStep: 1 as Min<1>,
                space: (placeEveryXLed - 1) as PositiveNumber,
                start: from as PositiveNumber,
                steps: steps,

                clr_r: color.r,
                clr_g: color.g,
                clr_b: color.b,

                modus: StepMode.SERIES,

                reversed: isReversed
            },
            block
        }
    });
}

//#endregion