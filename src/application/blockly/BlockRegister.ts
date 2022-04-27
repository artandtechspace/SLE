import registerColorBlocks from "./blocks/ColorBlocks.js";
import registerControlBlocks from "./blocks/ControlBlocks.js";
import Theme from "./Theme.js";
import { Toolbox } from "./Toolbox.js";
const Blockly = require("blockly");

// Shorts a function-name
const S: (name:string) => HTMLElement = document.querySelector.bind(document);

// Generates the options for blockly
const BLOCKLY_OPTIONS = {
	theme: Theme,
	toolbox : Toolbox, 
	collapse : false, 
	comments : false, 
	disable : true, 
	maxBlocks : Infinity, 
	trashcan : true, 
	horizontalLayout : false, 
	toolboxPosition : 'start', 
	css : true,
	rtl : false, 
	scrollbars : true, 
	sounds : true, 
	oneBasedIndex : true, 
	grid : {
		spacing : 20, 
		length : 1, 
		colour : '#888', 
		snap : false
	}, 
	zoom : {
		controls : true, 
		wheel : true, 
		startScale : 1, 
		maxScale : 3, 
		minScale : 0.3, 
		scaleSpeed : 1.2
	}
};



// Function that registers all blockly-blocks
// Returns the blockly-workspace
export function registerBlockly(){
	registerBlocks();

	return injectBlocklyIntoPage();
}

// Registers all blockly-blocks
function registerBlocks(){
	registerColorBlocks();
	registerControlBlocks();
}

// Injects blockly and return the workspace-handle
function injectBlocklyIntoPage(){
	// Gets the div where blockly will live
	var blocklyDiv = S('#blocklyDiv');

	// Creates the workspace
	var workspace = Blockly.inject(blocklyDiv, BLOCKLY_OPTIONS);
	Blockly.svgResize(workspace);

	// Awaits a resize event and updates blockly accordingly
  	new ResizeObserver(_=>Blockly.svgResize(workspace)).observe(blocklyDiv);

    return workspace;
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
