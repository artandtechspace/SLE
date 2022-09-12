import { DelayModule, DelayModuleConfig } from "../../defaultModules/DelayModule.js";
import { LoopModule, LoopModuleConfig } from "../../defaultModules/LoopModule.js";
import { ModBlockExport, ConfigBuilder } from "../../ConfigBuilder.js";
import { Min, PositiveNumber } from "../../types/Types.js";
import { CommentModule, CommentModuleConfig } from "../../defaultModules/CommentModule.js";
import { TB_COLOR_CONTROL } from "../util/Toolbox.js";
import { createBlocklyStyle } from "../util/BlocklyStyleBuilder.js";
import { Language } from "../../language/LanguageManager.js";
import { getParametricNumberMin } from "../util/BlocklyBlockUtils.js";

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
    const getText = "text";

    createBlocklyStyle(TB_COLOR_CONTROL)
        .withText("debug.//")
        .withTextfield(getText, Language.get("debug.Im am comment!"))
    .register(name);

    ConfigBuilder.registerModuleBlock<CommentModuleConfig>(name, function(block:any) {
        return {
            module: CommentModule,
            config: {
                text: block.getFieldValue(getText)
            },
            block
        }
    });
}

// Loop-block
function registerLoop(name: string){

    const getRepeats = "led";
    const getSubcode = "subcode";

    Blockly.Blocks[name] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Repeat")
                .appendField(new Blockly.FieldNumber(2, 2), getRepeats)
                .appendField("times");
            this.appendStatementInput(getSubcode)
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
        var submodules: ModBlockExport<any>[] = ConfigBuilder.generateModuleExports(block.getInputTargetBlock(getSubcode));

        // Gets the amount of loops
        var loopAmt: Min<2> = block.getFieldValue(getRepeats);

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

    const getTime = "time";

    createBlocklyStyle(TB_COLOR_CONTROL)
        .withText("debug.Wait")
        .withTextfield(getTime, "500")
        .withText("debug.ms")
    .register(name);

    ConfigBuilder.registerModuleBlock<DelayModuleConfig>(name, function(block:any) {
        const waitTime = getParametricNumberMin(block,getTime, 10, false);

        // Assembles the config
        return {
            module: DelayModule,
            config: {
                delay: waitTime as any as PositiveNumber
            },
            block
        }
    });
}


//#endregion