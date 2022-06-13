import { ConfigBuilder } from "../../ConfigBuilder.js";
import { GradientModule, GradientModuleConfig } from "../../defaultModules/animations/GradientModule.js";
import { RainbowModule, RainbowModuleConfig } from "../../defaultModules/animations/RainbowModule.js";
import { Environment } from "../../Environment.js";
import { HSV, Min, PercentageNumber, PositiveNumber, Range } from "../../types/Types.js";
import { getNumberFromCode, getNumberFromCodeAsMin, getNumberFromSettingsUI } from "../util/BlocklyBlockUtils.js";
import FieldBrightness from "../fields/FieldBrightness.js";
import FieldCustomColor from "../fields/FieldCustomColor.js";
import { TB_COLOR_ANIMATIONS } from "../util/Toolbox.js";
import { FadeModule, FadeModuleConfig } from "../../defaultModules/animations/FadeModule.js";
import { createUI } from "../settingsui/SettingsUI.js";
import { ParseMode } from "../settingsui/fields/NumericElement.js";

const Blockly = require("blockly");


/**
 * Registers all blockly-blocks that are used for animations
 */

export default function registerAnimationBlocks(){
    registerGradientBlock('sle_animation_gradient');
    registerRainbowBlock('sle_animation_rainbow');
    registerFadeBlock('sle_animation_fade');
}

//#region BlockRegister

function registerFadeBlock(name: string){
    // Names for the variables
    const getAnimationLength = "amtLen";
    const getLedFrom = "from";
    const getLedLength = "length";
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
                .addText("Testtext").breakLine()
                .addLineSeperator().breakLine()
                
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
                .addNumericField(getFadeLength, 500).hasMin(100).andThen()
                .addText("ms, until one fade-cycle is finished.")
                .addInfoIcon("How long one fade-cycle takes.")
                .breakLine()

                .addText("Every led has an offset of")
                .addNumericField(getLedOffset, 50).hasMin(1).andThen()
                .addText("ms from the previous led.")
                .addInfoIcon("Use this to create flow through the stripe.")
            .buildTo(this);
        }
      };

      ConfigBuilder.registerModuleBlock<FadeModuleConfig>(name, function(block:any, env: Environment) { 
        var from: HSV = block.getFieldValue('clrFrom');
        var to: HSV = block.getFieldValue('clrTo');
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

// Rainbow-block
function registerRainbowBlock(name: string){

    Blockly.Blocks[name] = {
        init: function() {
        this.appendValueInput("from")
            .setCheck("Number")
            .appendField("Rainbow From: ");
        this.appendValueInput("length")
            .setCheck("Number")
            .appendField("Length: ");
        this.appendValueInput("offsetPerLed")
            .setCheck("Number")
            .appendField("OffPerLed: ");
        this.appendValueInput("playLenght")
            .setCheck("Number")
            .appendField("AnimationLength: ");
        this.appendValueInput("repeatLength")
            .setCheck("Number")
            .appendField("Until-Repeat-length: ");
        this.appendDummyInput()
            .appendField("Bright: ")
            .appendField(new FieldBrightness(),"bright");
          this.setColour(TB_COLOR_ANIMATIONS);
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setInputsInline(true);
        }
    };

    ConfigBuilder.registerModuleBlock<RainbowModuleConfig>(name, function(block:any, env: Environment) { 
        var from: PositiveNumber = getNumberFromCodeAsMin(block,"from", 0, env);
        var length = getNumberFromCodeAsMin(block,"length", 1, env);
        var offsetPerLed = getNumberFromCode(block, "offsetPerLed", env);
        var playLenght = getNumberFromCodeAsMin(block, "playLenght", 0, env);
        var repeatLength = getNumberFromCodeAsMin(block, "repeatLength", 500, env);
        
        var brightness: number = block.getFieldValue("bright");
    
        return {
            module: RainbowModule,
            config: {
                ...RainbowModule.DEFAULT_CONFIG,
                ledFrom: from,
                ledLength: length,
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

    Blockly.Blocks[name] = {
        init: function() {
          this.appendValueInput("length")
              .setCheck("Number")
              .appendField("Gradient (")
              .appendField(new Blockly.FieldDropdown([["normal",MODUS_NORMAL], ["Reverse-Color",MODUS_REVERSE_COLOR], ["Reverse-Direction",MODUS_REVERSE_DIRECTION], ["Reverse (Color and Direction)",MODUS_BOTH]]), "modus")
              .appendField(") from")
              .appendField(new FieldCustomColor(), "colorFrom")
              .appendField("to")
              .appendField(new FieldCustomColor({ h: 0.1 as PercentageNumber, s: 1 as PercentageNumber, v: 1 as PercentageNumber }), "colorTo")
              .appendField("with");
          this.appendValueInput("start")
              .setCheck("Number")
              .appendField("leds, starting from");
          this.appendValueInput("delay")
              .setCheck("Number")
              .appendField("and a delay between leds of");
          this.appendDummyInput()
              .appendField("ms");
          this.setColour(TB_COLOR_ANIMATIONS);
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setInputsInline(true);
        }
    };

    ConfigBuilder.registerModuleBlock<GradientModuleConfig>(name, function(block:any, env: Environment) { 
        var start: PositiveNumber = getNumberFromCodeAsMin(block,"start", 0, env);
        var length: PositiveNumber = getNumberFromCodeAsMin(block,"length", 0, env);
        var colorFrom: HSV = block.getFieldValue("colorFrom");
        var colorTo: HSV = block.getFieldValue("colorTo");
        var delay: PositiveNumber = getNumberFromCodeAsMin(block,"delay", 0, env);
    
        // Selected modus
        var modus:string = block.getFieldValue('modus');

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