import { BlockError } from "../errorSystem/Error.js";

const Blockly = require("blockly");

// Takes in the blockly-block and the code-field that returns the number and returns the number

/**
 * Takes in the blockly-block and field to get the number from.
 * Also takes in an optional min- @param min and/or max-value @param max which can optionally throw an error.
 * 
 * @throws {BlockError} if anything is not perfectly exptected with the number.
 * @returns the parsed number
 */
export function getNumberFromCode(block: any,field: string, min?: number, max?: number){
    // Reads the value and passes it
    var val = parseInt(Blockly.JavaScript.valueToCode(block, field, Blockly.JavaScript.ORDER_ATOMIC));

    // Ensures that the number is valid
    if(isNaN(val))
        throw new BlockError(`The '${field}'-value is not given.`,block);

    // Ensures that the number is within the required range. (min)
    if(min !== undefined && val < min)
        throw new BlockError(`The '${field}'-value must be >= ${min}`,block);
    
    // Ensures that the number is within the required range. (max)
    if(max !== undefined && val > max)
        throw new BlockError(`The '${field}'-value must be >= ${max}`,block);

    return val;
}


// Takes in a given string that got provided by any blocky-code generator and which contains the module-configs.
export function parseConfigsFromBlocks(cfg: string): []{
    cfg = cfg.trim();

    // Checks if the element already is an array
    if(cfg.startsWith("[") && cfg.endsWith("]"))
        return JSON.parse(cfg) as [];

    // Checks if they do end with a comma
    if(!cfg.endsWith(","))
        return [];

    return JSON.parse("["+cfg.substring(0,cfg.length-1)+"]") as [];
}

// Function use by the blocks to package their config-object into a state that can be passed up the block-chain as a json-object
export function packageBlockConfig(config: Object){
    return JSON.stringify(config)+",";
}