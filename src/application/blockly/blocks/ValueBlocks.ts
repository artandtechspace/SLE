import { ConfigBuilder } from "../../ConfigBuilder.js";
import { Environment } from "../../Environment.js";

const Blockly = require("blockly");


/**
 * This file registers all blocks that are used for the value-supplie of the sle. Eg. Numbers
 */


 export default function registerValueBlocks(){
    
    registerNumberBlock();

    registerLedAmountBlock("sle_values_ledamount");
}


// Math's num block
function registerNumberBlock(){
    // Name of the block
    const name = "math_number";

    ConfigBuilder.registerValueSupplier(name,(block: any, env:Environment)=>{
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
          this.setColour(20);
        }
    };

    ConfigBuilder.registerValueSupplier(name,(block: any, env:Environment)=>{
        return env.ledAmount;
    });
}