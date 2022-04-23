import registerColorBlocks from "./blocks/ColorBlocks.js";
import registerControlBlocks from "./blocks/ControlBlocks.js";

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


// Function that registers all blockly-blocks
export function registerBlockyBlocks(){
    registerColorBlocks();
    registerControlBlocks();
}