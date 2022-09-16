import { IS_DEBUGGING } from "../Preset";
import registerAnimationBlocks from "./blocks/AnimationBlocks";
import registerColorBlocks from "./blocks/ColorBlocks";
import registerControlBlocks from "./blocks/ControlBlocks";
import registerDebugBlocks from "./blocks/DebuggingBlocks";
import registerGoggleBlocks from "./blocks/GoggleBlocks";
import registerSpecialBlocks from "./blocks/SpecialBlocks";
import Theme from "./util/Theme";
import { buildToolBox } from "./util/Toolbox";
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
	
	// Normal block registry
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

	// Creates the setup element
	var setup = workspace.newBlock("sle_setup");
	setup.moveBy(100,100);
	setup.initSvg();
	setup.render();	

	// Creates the root element
	var root = workspace.newBlock("sle_root");
	root.moveBy(450,100);
	root.initSvg();
	root.render();
}


