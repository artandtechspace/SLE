import { IS_DEBUGGING } from "../Preset.js";
import { S } from "../ui/utils/UiUtils.js";
import registerAnimationBlocks from "./blocks/AnimationBlocks.js";
import registerColorBlocks from "./blocks/ColorBlocks.js";
import registerControlBlocks from "./blocks/ControlBlocks.js";
import registerDebugBlocks from "./blocks/DebuggingBlocks.js";
import registerGoggleBlocks from "./blocks/GoggleBlocks.js";
import registerSpecialBlocks from "./blocks/SpecialBlocks.js";
import Theme from "./util/Theme.js";
import { buildToolBox } from "./util/Toolbox.js";
const Blockly = require("blockly");


// Function that registers all blockly-components
// Returns the blockly-workspace
export function registerBlockly(blocklyArea: HTMLDivElement){	
	registerBlocks();

	// Injects blockly to the page and creates the workspace
	var ws = injectBlocklyIntoPage(blocklyArea);

	// Appends the root element and disables any non-root elements
	addRootToPage(ws);	

	return ws;
}




// Registers all blockly-blocks
function registerBlocks(){
	// Add special blocks like the root-block etc.
	registerSpecialBlocks();
	
	registerColorBlocks();
	registerControlBlocks();
	registerAnimationBlocks();
	registerGoggleBlocks();

	// Only registers debug-blocks in debug-environment
	if(IS_DEBUGGING)
		registerDebugBlocks();
}


// Injects blockly and return the workspace-handle
function injectBlocklyIntoPage(blocklyArea: HTMLDivElement){
	// Creates the workspace
	var workspace = Blockly.inject(blocklyArea, buildBlocklyOptions());
	Blockly.svgResize(workspace);

	// Awaits a resize event and updates blockly accordingly
  	new ResizeObserver(_=>Blockly.svgResize(workspace)).observe(blocklyArea);

    return workspace;
}

// Generates the options for blockly
function buildBlocklyOptions(){
	return {
		theme: Theme,
		toolbox : buildToolBox(), 
		collapse : false, 
		comments : false, 
		disable : false,
		maxBlocks : Infinity, 
		trashcan : true,
		media: './resources/blockly/',
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


