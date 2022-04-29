const Blockly = require("blockly");

// Takes in the blockly-block and the code-field that returns the number and returns the number
export function getNumberFromCode(block: any,field: string, orValue: number = NaN){
    // Reads the value and passes it
    var val = parseInt(Blockly.JavaScript.valueToCode(block, field, Blockly.JavaScript.ORDER_ATOMIC));

    return isNaN(val) ? orValue : val;
}