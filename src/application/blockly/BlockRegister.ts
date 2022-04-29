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
	disable : false,
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

	// Injects blockly to the page and creates the workspace
	var ws = injectBlocklyIntoPage();

	// Appends the root element and disables any non-root elements
	addRootToPage(ws);

	return ws;
}

// Registers all blockly-blocks
function registerBlocks(){
	registerColorBlocks();
	registerControlBlocks();
}

// Adds the root element to the page and disables any non-root elements
function addRootToPage(workspace: any){
	// Disables any element that are not the root generator element or it's children
	workspace.addChangeListener(Blockly.Events.disableOrphans);

	// Creates the root element
	Blockly.serialization.blocks.append({
		'type': 'sle_root',
		"x": 100,
		"y": 100,
	}, workspace);
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
