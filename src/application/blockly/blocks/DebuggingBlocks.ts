import { ColorModule, ColorModuleConfig, StepMode } from "../../defaultModules/ColorModule.js";
import { BlockError } from "../../errorSystem/Errors.js";
import { ConfigBuilder } from "../../ConfigBuilder.js";
import { Min, PositiveNumber, RGB, RGBNumber } from "../../types/Types.js";
import { getNumberFromSettingsUI, getParametricNumber, getParametricNumberMin, getRGBFromCode, getValueFromSettingsUI } from "../util/BlocklyBlockUtils.js";
import FieldCustomColor from "../fields/FieldCustomColor.js";
import { TB_COLOR_COLOR } from "../util/Toolbox.js";
import { getEnvironment } from "../../SharedObjects.js";
import { createUI } from "../settingsui/SettingsUI.js";
import { AnimationDirection, BBConsts } from "../util/BlocklyBlockConstants.js";
import { FadeModule, FadeModuleConfig } from "../../defaultModules/animations/FadeModule.js";

const Blockly = require("blockly");

/**
 * Registers all blocks that are using the color-module
 */

export default function registerDebugBlocks(){
    registerDebug1("sle_debug_1");

}

//#region BlockRegister


// Colors multiple leds in a row
// TODO: Remove this debug block
function registerDebug1(name: string){

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

//#endregion