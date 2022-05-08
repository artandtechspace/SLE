import { ConfigBuilder } from "../../ConfigBuilder.js";
import { GradientModule, GradientModuleConfig } from "../../defaultModules/GradientModule.js";
import { Environment } from "../../Environment.js";
import { HexColor, PositiveNumber } from "../../types/Types.js";
import { HSV } from "../../utils/ColorUtils.js";
import { getHexFromCode, getNumberFromCodeAsMin } from "../BlocklyUtils.js";
import FieldCustomColor from "../fields/FieldCustomColor.js";
import { TB_COLOR_VALUES } from "../Toolbox.js";

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
          this.setColour(TB_COLOR_VALUES);
        }
    };

    ConfigBuilder.registerValueSupplier(name,(block: any, env:Environment)=>{
        return env.ledAmount;
    });
}