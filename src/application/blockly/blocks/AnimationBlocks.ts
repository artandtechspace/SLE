import { ConfigBuilder } from "../../ConfigBuilder.js";
import { GradientModule, GradientModuleConfig } from "../../defaultModules/GradientModule.js";
import { RainbowModule, RainbowModuleConfig } from "../../defaultModules/RainbowModule.js";
import { Environment } from "../../Environment.js";
import { Min, PositiveNumber, Range } from "../../types/Types.js";
import { HSV } from "../../utils/ColorUtils.js";
import { getNumberFromCode, getNumberFromCodeAsMin, getNumberFromCodeAsPercentage } from "../BlocklyUtils.js";
import FieldBrightness from "../fields/FieldBrightness.js";
import FieldCustomColor from "../fields/FieldCustomColor.js";
import { TB_COLOR_ANIMATIONS } from "../Toolbox.js";

const Blockly = require("blockly");


/**
 * This file registers all blocks that are used for the value-supplie of the sle. Eg. Numbers
 */

export default function registerAnimationBlocks(){
    registerGradientBlock('sle_animation_gradient');
    registerRainbowBlock('sle_animation_rainbow');
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
                ledFrom: from,
                ledLength: length,
                offsetPerLedInMs: offsetPerLed,
                playLength: playLenght,
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
              .appendField(new FieldCustomColor({ h: 0.1, s: 1, v: 1 }), "colorTo")
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
