import { getNumberFromCode, packageBlockConfig, parseConfigsFromBlocks } from "../BlocklyUtils.js";
const Blockly = require("blockly");

/**
 * This file registers all blocks that are used for the general logic of the sle
 */


export default function registerControlBlocks(){
    registerRoot();
    
    registerLoop();
    registerDelay();
}



// Loop-block
function registerLoop(){
    Blockly.Blocks['sle_control_loop'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Repeat")
            this.appendValueInput("loopAmount")
                .setCheck("Number")
            this.appendDummyInput()
                .appendField("times");
            this.appendStatementInput("loops")
                .setCheck(null);
            this.setInputsInline(false);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(230);
            this.setInputsInline(true);
        }
    };

    Blockly.JavaScript['sle_control_loop'] = function(block:any) {
        // Gets the subconfig code
        var subConfig = Blockly.JavaScript.statementToCode(block, 'loops');
        
        // Assembles the config
        return packageBlockConfig({
            name: "loop",
            config: {
                // How often the code shall be looped
                repeats: getNumberFromCode(block,"loopAmount"),
                // Parsed subblocks that shall be looped
                modules: parseConfigsFromBlocks(subConfig)
            }
        });
    };
}

// Delay-register
function registerDelay(){
    Blockly.Blocks['sle_control_delay'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("wait")
            this.appendValueInput("time")
                .setCheck("Number")
                .appendField(new Blockly.FieldDropdown([["ms","millis"],["millis","seconds"]]), "timeUnit");
            this.setInputsInline(false);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(230);
            this.setInputsInline(true);
        }
    };

    Blockly.JavaScript['sle_control_delay'] = function(block:any) {
        var waitTime = getNumberFromCode(block,"time");
        var timeUnit = block.getFieldValue('timeUnit');

        // Gets the multiplicator based on the time-unit
        var multiplicator = timeUnit === "seconds" ? 1000 : 1; 

        // Ensures that the delay is given
        if(isNaN(waitTime))
            throw "Delay is not set.";

        // Assembles the config
        return `${waitTime*multiplicator},`;
    };
}

// Root-block (All others shall be disabled)
function registerRoot(){
    Blockly.Blocks['sle_root'] = {
        init: function() {
          this.appendDummyInput()
              .appendField("Program-Plan");
          this.setNextStatement(true, null);
          this.setDeletable(false);
          this.setEditable(false);
          this.setMovable(false);
        }
    };

    Blockly.JavaScript["sle_root"] = ()=>"";
}