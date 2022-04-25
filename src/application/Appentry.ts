// Import
import { parseConfigsFromBlocks, registerBlockyBlocks } from "./blockly/BlockRegister.js";
import { Toolbox } from "./blockly/Toolbox.js";
import { tryParseModules } from "./codegenerator/ConfigValidator.js";
import { Environment } from "./Environment.js";
import { ArduinoSimulation } from "./simulation/ArduinoSimulation.js";
const Blockly = require("blockly");





// Generates the options for blockly
var blocklyOptions = { 
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


// Workspace for blockly
var workspace: object;

// Arduino-simulation
var simulation: ArduinoSimulation = new ArduinoSimulation();

/**
 * Event: When the generate-code button get's clicked
 */
function onGenCodeClicked(){
	var config = parseConfigsFromBlocks(Blockly.JavaScript.workspaceToCode(workspace));

	console.log("Config: ");
	console.log(config);
	
	

	var mods = tryParseModules(config);

	if(typeof mods === "string"){
		console.log("Error: "+mods);
		return;
	}

	simulation.startSimulation(new Environment(20,false,"",2),mods);
}

/**
 * Gets called once the general environment for the app got setup. Eg. the electron browser-window or the inbrowser setup got done.
 */
export default function onAppInitalize(){
	// Shorts a function-name
	const S: (name:string) => HTMLElement = document.querySelector.bind(document);
	
	// Initalizes all blockly-blocks
	registerBlockyBlocks();

  	// Creates the workspace with blockly
  	workspace = Blockly.inject('blocklyDiv', blocklyOptions);

  	// Adds all event's
  	S("#genCode").onclick = onGenCodeClicked;

	// Attaches the simulation
	simulation.attachToPreview(S("#simulationPreview"));

}