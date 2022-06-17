import { ConfigBuilder } from "../../ConfigBuilder.js";
import { Environment } from "../../Environment.js";
import { getEnvironment } from "../../SharedObjects.js";
import { TB_COLOR_VALUES } from "../util/Toolbox.js";

const Blockly = require("blockly");


/**
 * Registers all blocks that are used for the value-supplie. Eg. Numbers or variables
 */


export default function registerValueBlocks(){
    registerNumberBlock();
    registerLedAmountBlock("sle_values_ledamount");
}

//#region BlockRegister

// Math's num block
function registerNumberBlock(){
    // Name of the block
    const name = "math_number";

    ConfigBuilder.registerValueSupplier(name,(block: any)=>{
        return block.getFieldValue("NUM");
    });
}

// Block that just returns the defined led-amount of the project
function registerLedAmountBlock(name: string){
    Blockly.Blocks[name] = {
        init: function() {
          this.appendDummyInput()
              .appendField("Led-Amount");
          this.setOutput(true, "Number");
          this.setColour(TB_COLOR_VALUES);
        }
    };

    ConfigBuilder.registerValueSupplier(name,(block: any)=>{
        return getEnvironment().ledAmount;
    });
}

//#endregion