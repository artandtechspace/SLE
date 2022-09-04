import { ConfigBuilder } from "../../ConfigBuilder.js";
import { HSV, Min, PercentageNumber, PositiveNumber, Range, RGB, RGBNumber } from "../../types/Types.js";
import { getNumberFromCodeAsMin, getNumberFromSettingsUI, getParametricNumberMin, getRGBFromCode, getValueFromSettingsUI } from "../util/BlocklyBlockUtils.js";
import FieldCustomColor from "../fields/FieldCustomColor.js";
import { TB_COLOR_ANIMATIONS, TB_COLOR_DEBUG, TB_COLOR_GOGGLES } from "../util/Toolbox.js";
import { FadeModule, FadeModuleConfig } from "../../defaultModules/animations/FadeModule.js";
import { createUI } from "../settingsui/SettingsUI.js";
import { SystemParams } from "../../parameterCalculator/system/internal/ParameterSystemModel.js";
import { getEnvironment } from "../../SharedObjects.js";
import { ColorModule, ColorModuleConfig, StepMode } from "../../defaultModules/ColorModule.js";
import { AnimationDirection, BBConsts } from "../util/BlocklyBlockConstants.js";
import { GradientModule, GradientModuleConfig } from "../../defaultModules/animations/GradientModule.js";

const Blockly = require("blockly");

// For dropdown-select's using lenses
enum LenseType {
    RIGHT= "right",
    LEFT= "left",
    BOTH= "both"
};

// Mappings of the enums
const LenseTypeBlocklyArray = [["the right", LenseType.RIGHT], ["the left", LenseType.LEFT], ["both", LenseType.BOTH]];

/**
 * Registers all blockly-blocks that are used for animations
 */

export default function registerGoogleBlocks(){
    registerTurnOff("sle_goggles_turnoff");
    registerColorBlock('sle_goggles_color');
    registerColorOnlyLense('sle_goggles_color_lense');
    registerFade("sle_goggles_fade");
    registerGradient("sle_goggles_gradient");
}

//#region Util-functions

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

    Blockly.Blocks[name] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Turn off")
                .appendField(new Blockly.FieldDropdown(LenseTypeBlocklyArray), getLense)
                .appendField("lense(s)")
            this.setInputsInline(true);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(TB_COLOR_GOGGLES);
        }
      };

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


// Fade-Block
function registerGradient(name: string){
    // Names for the variables
    const getColorFrom = "colorfrm";
    const getColorTo = "colorto";
    const getLense = "lense";
    const getTime = "time";
    const getDirection = "direction";
    const getClrDir = "clrdir";

    Blockly.Blocks[name] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Gradient over")
                .appendField(new Blockly.FieldDropdown(LenseTypeBlocklyArray), getLense)
                .appendField("lense(s) from")
                .appendField(new FieldCustomColor(), getColorFrom)
                .appendField("to")
                .appendField(new FieldCustomColor({ h: .4, s: 1, v: 1 }), getColorTo)
                .appendField("in")
                .appendField(new Blockly.FieldTextInput("1000"), getTime)
                .appendField("ms")
            this.setInputsInline(true);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(TB_COLOR_GOGGLES);

            createUI()
                .addText("The direction is ")
                .addDropdown(getDirection, BBConsts.Direction_UI)
                .addText(".")
                .addInfoIcon("Plays the animation eigther forward or in reverse.")
                .breakLine()

                .addText("The color is ")
                .addDropdown(getClrDir, BBConsts.Direction_UI)
                .addText(".")
                .addInfoIcon("Displays the color in reverse.")
                .breakLine()

            .buildTo(this);
        }
      };

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
        var delay = lenseMulti * Math.round(playTime/length) as PositiveNumber;

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

    Blockly.Blocks[name] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Fade")
                .appendField(new Blockly.FieldDropdown(LenseTypeBlocklyArray), getLense)
                .appendField("lense(s) from")
                .appendField(new FieldCustomColor(), getColorFrom)
                .appendField("to")
                .appendField(new FieldCustomColor({ h: .4, s: 1, v: 1 }), getColorTo)
                .appendField("for")
                .appendField(new Blockly.FieldTextInput("1000"), getTime)
                .appendField("ms")
            this.setInputsInline(true);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(TB_COLOR_GOGGLES);
        }
      };

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

    Blockly.Blocks[name] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Color")
                .appendField(new Blockly.FieldDropdown(LenseTypeBlocklyArray), getLense)
                .appendField("lense(s) in")
                .appendField(new FieldCustomColor(), getColor)
            this.setInputsInline(true);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(TB_COLOR_GOGGLES);
            
            createUI()
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
            .buildTo(this);
        }
      };

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
                steps: 1 as Min<1>,

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

// Color-Left-Right-Both-Google(s)
function registerColorBlock(name: string){
    // Names for the variables
    const getColor = "color";
    const getDropdownDesc = "every"
    const getLense = "lense";
    const getTime = "time";
    const getDirection = "direction";
    const getStartIndex = "start";

    // List with the dropdown-selection elements
    const DropdownDecisions = [
        ["2nd", "2"],
        ["3rd", "3"],
        ["4th", "4"],
        ["5th", "5"],
        ["6th", "6"],
        ["7th", "7"],
        ["8th", "8"],
    ]

    Blockly.Blocks[name] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Color every")
                .appendField(new Blockly.FieldDropdown(DropdownDecisions), getDropdownDesc)
                .appendField("led of")
                .appendField(new Blockly.FieldDropdown(LenseTypeBlocklyArray), getLense)
                .appendField("lense(s) with")
                .appendField(new FieldCustomColor(), getColor)
                .appendField("in")
                .appendField(new Blockly.FieldTextInput("1000"), getTime)
                .appendField("ms");
            this.setInputsInline(true);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(TB_COLOR_GOGGLES);
            
            createUI()
                .addText("Play the animation ")
                .addDropdown(getDirection, BBConsts.Direction_UI)
                .addText(".")
                .addInfoIcon("Plays the animation eigther forward or in reverse.")
                .breakLine()

                .addText("Start from led ")
                .addNumericField(getStartIndex, 0)
                .hasMin(0)
                .andThen()
            .buildTo(this);
        }
      };

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