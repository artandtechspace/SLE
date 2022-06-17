import { DelayModule, DelayModuleConfig } from "../../defaultModules/DelayModule.js";
import { LoopModule, LoopModuleConfig } from "../../defaultModules/LoopModule.js";
import { Environment } from "../../Environment.js";
import { ModBlockExport, ConfigBuilder } from "../../ConfigBuilder.js";
import { Min, PositiveNumber } from "../../types/Types.js";
import { getNumberFromCodeAsMin } from "../util/BlocklyBlockUtils.js";
import { CommentModule, CommentModuleConfig } from "../../defaultModules/CommentModule.js";
import { TB_COLOR_CONTROL } from "../util/Toolbox.js";

const Blockly = require("blockly");

/**
 * Registers all blocks that are used for general logic like delay or repeat functions
 */


export default function registerControlBlocks(){
    registerLoop("sle_control_loop");
    registerDelay("sle_control_delay");
    registerComment("sle_control_comment");
}

//#region BlockRegister

function registerComment(name: string){
    Blockly.Blocks[name] = {
        init: function() {
          this.appendDummyInput()
              .appendField("//")
              .appendField(new Blockly.FieldTextInput("Im a comment in the code."), "text");
            this.setInputsInline(false);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(90);
            this.setInputsInline(true);
        }
    };

    ConfigBuilder.registerModuleBlock<CommentModuleConfig>(name, function(block:any) {
        return {
            module: CommentModule,
            config: {
                text: block.getFieldValue("text")
            },
            block
        }
    });
}

// Loop-block
function registerLoop(name: string){
    Blockly.Blocks[name] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Repeat")
            this.appendValueInput("repeat-amount")
                .setCheck("Number")
            this.appendDummyInput()
                .appendField("times");
            this.appendStatementInput("loops")
                .setCheck(null);
            this.setInputsInline(false);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(TB_COLOR_CONTROL);
            this.setInputsInline(true);
        }
    };

    ConfigBuilder.registerModuleBlock<LoopModuleConfig>(name, function(block:any) {
        // Gets the submodules
        var submodules: ModBlockExport<any>[] = ConfigBuilder.generateModuleExports(block.getInputTargetBlock("loops"));

        // Gets the amount of loops
        var loopAmt: Min<2> = getNumberFromCodeAsMin(block,"repeat-amount", 2);

        return {
            module: LoopModule,
            config: {
                repeats: loopAmt,
                submodules
            },
            block
        }
    });
}

// Delay-register
function registerDelay(name: string){
    Blockly.Blocks[name] = {
        init: function() {
            this.appendDummyInput()
                .appendField("wait")
            this.appendValueInput("time")
                .setCheck("Number")
                .appendField(new Blockly.FieldDropdown([["ms","millis"],["seconds","seconds"]]), "timeUnit");
            this.setInputsInline(false);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(TB_COLOR_CONTROL);
            this.setInputsInline(true);
        }
    };

    ConfigBuilder.registerModuleBlock<DelayModuleConfig>(name, function(block:any) {
        var waitTime: PositiveNumber = getNumberFromCodeAsMin(block,"time", 0);
        var timeUnit = block.getFieldValue('timeUnit');

        // Gets the multiplicator based on the time-unit
        var multiplicator = timeUnit === "seconds" ? 1000 : 1; 

        // Assembles the config
        return {
            module: DelayModule,
            config: {
                delay: (waitTime * multiplicator) as PositiveNumber
            },
            block
        }
    });
}


//#endregion