import { ConfigBuilder } from "../../ConfigBuilder.js";
import { GradientModule, GradientModuleConfig } from "../../defaultModules/animations/GradientModule.js";
import { RainbowModule, RainbowModuleConfig } from "../../defaultModules/animations/RainbowModule.js";
import { HSV, Min, PercentageNumber, PositiveNumber, Range } from "../../types/Types.js";
import { getNumberFromSettingsUI } from "../util/BlocklyBlockUtils.js";
import FieldBrightness from "../fields/FieldBrightness.js";
import FieldCustomColor from "../fields/FieldCustomColor.js";
import { TB_COLOR_ANIMATIONS } from "../util/Toolbox.js";
import { FadeModule, FadeModuleConfig } from "../../defaultModules/animations/FadeModule.js";
import { createUI } from "../settingsui/SettingsUI.js";

const Blockly = require("blockly");


/**
 * Registers all blockly-blocks that are used for animations
 */

export default function registerAnimationBlocks(){
    registerGradientBlock('sle_animation_gradient');
    registerRainbowBlock('sle_animation_rainbow');
    registerRainbowAutocalcBlock("sle_animation_rainbow_autocalc");
    registerFadeBlock('sle_animation_fade');

    // TODO: Remove debug block
    registerDebug('sle_debug');
}

//#region BlockRegister

// TODO: Remove debug block
function registerDebug(name: string){
    Blockly.Blocks[name] = {
        init: function() {
          this.appendDummyInput()
              .appendField("Create a gradiant from")
              .appendField(new Blockly.FieldColour("#ff0000"), "a")
              .appendField("to")
              .appendField(new Blockly.FieldColour("#ff0000"), "b")
              .appendField("using mode")
              .appendField(new Blockly.FieldDropdown([["option","OPTIONNAME"], ["option","OPTIONNAME"], ["option","OPTIONNAME"]]), "c")
              .appendField(".");
          this.appendDummyInput()
              .appendField("It has a length of")
              .appendField(new Blockly.FieldNumber(0), "d")
              .appendField("leds and starts from led")
              .appendField(new Blockly.FieldNumber(0), "e")
              .appendField(".");
          this.appendDummyInput()
              .appendField("Wait")
              .appendField(new Blockly.FieldNumber(0), "f")
              .appendField("ms between turning on leds.");
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setColour(TB_COLOR_ANIMATIONS);
            this.setTooltip("");
            this.setHelpUrl("");

            createUI()
            .addText("Lul").breakLine()
                .addText("Lul").addColorField("test").addBrightnessField("Yooo").addText("Lul")
                .breakLine().addText("Lul")
            .buildTo(this);
        }
      };

    ConfigBuilder.registerModuleBlock<FadeModuleConfig>(name, function(block:any) { 
        return {
            block,
            module: FadeModule,
            config: {
                ...FadeModule.DEFAULT_CONFIG,
                color_frm_h: 0 as PercentageNumber,
                color_frm_s: 1 as PercentageNumber,
                color_frm_v: 1 as PercentageNumber,
                color_to_h: 1 as PercentageNumber,
                color_to_s: 1 as PercentageNumber,
                color_to_v: 1 as PercentageNumber,
                ledFrom: 0 as PositiveNumber,
                ledLength: 32 as Min<1>,
                offsetPerLedInMs: 50 as PositiveNumber,
                playLengthInMs: 5000 as PositiveNumber,
                repeatLengthInMs: 1000 as PositiveNumber
            }
        }
    });
}

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

    Blockly.Blocks[name] = {
        init: function() {
            this.appendDummyInput("ledLength")
                .appendField("Fade between")
                .appendField(new FieldCustomColor({h: .6 as PercentageNumber, s: .4 as PercentageNumber, v: 1 as PercentageNumber}), getColorFrom)
                .appendField("and")
                .appendField(new FieldCustomColor({h: .75 as PercentageNumber, s: .4 as PercentageNumber, v: 1 as PercentageNumber}), getColorTo);
            this.setInputsInline(true);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(TB_COLOR_ANIMATIONS);
            
            createUI()
                .addText("Fade for")
                .addNumericField(getAnimationLength, 5000).hasMin(0).andThen()
                .addText("ms")
                .addInfoIcon("How long the animation will play before moving on to the next block.")
                .breakLine()

                .addText("from led")
                .addNumericField(getLedFrom, 0).hasMin(0).andThen()
                .addText("over")
                .addNumericField(getLedLength,32).hasMin(1).andThen()
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
            .buildTo(this);
        }
      };

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

    Blockly.Blocks[name] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Rainbow with a brightness of")
                .appendField(new FieldBrightness(),getBrightness);
            this.setColour(TB_COLOR_ANIMATIONS);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setInputsInline(true);
            
            createUI()
                .addText("The Animation starts from led")
                .addNumericField(getLedFrom,0).hasMin(0).andThen()
                .addText("and runs for")
                .addNumericField(getLedLength,32).hasMin(0).andThen()
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
            .buildTo(this);
        }
    };

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

    Blockly.Blocks[name] = {
        init: function() {
        this.appendDummyInput()
            .appendField("Rainbow with a brightness of")
            .appendField(new FieldBrightness(),getBrightness)
            .appendField("(Led-offset)");
        this.setColour(TB_COLOR_ANIMATIONS);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setInputsInline(true);
          
          
        createUI()
            .addText("Create a Rainbow for")
            .addNumericField(getAnimationLength,500).hasMin(100).andThen()
            .addText("ms.")
            .addInfoIcon("How long the Rainbow is shown before moving to the next block.")
            .breakLine()

            .addText("Start from led")
            .addNumericField(getLedFrom,0).hasMin(0).andThen()
            .addText("and draw")
            .addNumericField(getLedLength,32).hasMin(0).andThen()
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
        .buildTo(this);
        }
    };

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

    Blockly.Blocks[name] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Gradient from")
                .appendField(new FieldCustomColor(), getColorFrom)
                .appendField("to")
                .appendField(new FieldCustomColor({ h: 0.1 as PercentageNumber, s: 1 as PercentageNumber, v: 1 as PercentageNumber }), getColorTo)
                .appendField("with mode")
                .appendField(new Blockly.FieldDropdown([["normal",MODUS_NORMAL], ["Reverse-Color",MODUS_REVERSE_COLOR], ["Reverse-Direction",MODUS_REVERSE_DIRECTION], ["Reverse (Color and Direction)",MODUS_BOTH]]), getMode);
            this.setColour(TB_COLOR_ANIMATIONS);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setInputsInline(true);
            
            createUI()
                .addText("Gradient from led")
                .addNumericField(getLedFrom,0).hasMin(0).andThen()
                .addText("over")
                .addNumericField(getLedLength,32).hasMin(0).andThen()
                .addText("leds.")
                .addInfoIcon("Specify the animation's starting led and led-length.")
                .breakLine()

                .addText("Wait")
                .addNumericField(getLedDelay,100).hasMin(0).andThen()
                .addText("ms between turning on leds.")
                .addInfoIcon("This waits a given amount of time before turning the next led on.")
            .buildTo(this);
        
        }
    };

    ConfigBuilder.registerModuleBlock<GradientModuleConfig>(name, function(block:any) { 
        var start: PositiveNumber = getNumberFromSettingsUI(block,getLedFrom) as PositiveNumber;
        var length: PositiveNumber = getNumberFromSettingsUI(block,getLedLength) as PositiveNumber;
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