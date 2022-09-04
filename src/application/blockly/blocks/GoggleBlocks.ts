import { ConfigBuilder } from "../../ConfigBuilder.js";
import { HSV, Min, PercentageNumber, PositiveNumber, Range, RGB } from "../../types/Types.js";
import { getNumberFromCodeAsMin, getNumberFromSettingsUI, getParametricNumberMin, getRGBFromCode } from "../util/BlocklyBlockUtils.js";
import FieldCustomColor from "../fields/FieldCustomColor.js";
import { TB_COLOR_ANIMATIONS, TB_COLOR_DEBUG, TB_COLOR_GOGGLES } from "../util/Toolbox.js";
import { FadeModule, FadeModuleConfig } from "../../defaultModules/animations/FadeModule.js";
import { createUI } from "../settingsui/SettingsUI.js";
import { SystemParams } from "../../parameterCalculator/system/internal/ParameterSystemModel.js";
import { getEnvironment } from "../../SharedObjects.js";
import { ColorModule, ColorModuleConfig, StepMode } from "../../defaultModules/ColorModule.js";
import { AnimationDirection, BBConsts } from "../util/BlocklyBlockConstants.js";

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
    registerColorBlock('sle_goggles_color');
}

//#region BlockRegister


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
        const lence: LenseType = block.getFieldValue(getLense);
        const isReversed: boolean = block.getFieldValue(getDirection) == AnimationDirection.REVERSE;

        // How long the animation shall play
        const playTime: PositiveNumber = getParametricNumberMin(block,getTime, 0, false);

        // Color every nth led, this is n
        const placeEveryXLed: number = parseInt(block.getFieldValue(getDropdownDesc));
        // From where to start coloring
        const startIdx: PositiveNumber = getNumberFromSettingsUI(block, getStartIndex) as Min<0>;

        // Current amount of leds
        const ledAmt = getEnvironment().ledAmount;

        // Half of the led amount
        var halfledAmt = Math.floor(ledAmt/2);

        // From which led the coloring starts
        var from = (lence === LenseType.LEFT ? halfledAmt : 0) + startIdx;
        // How many leds will be affected
        var length = (lence === LenseType.BOTH ? ledAmt : halfledAmt) - startIdx;

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