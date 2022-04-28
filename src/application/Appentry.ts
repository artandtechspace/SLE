// Import
import { parseConfigsFromBlocks, registerBlockly } from "./blockly/BlockRegister.js";
import registerCustomFields from "./blockly/fields/FieldRegistry.js";
import { tryParseModules } from "./codegenerator/ConfigValidator.js";
import { Environment } from "./Environment.js";
import { ArduinoSimulation } from "./simulation/ArduinoSimulation.js";
import { setupUi } from "./ui/UiSetup.js";
import { TabHandler } from "./ui/utils/TabHandler.js";
const Blockly = require("blockly");






// Workspace for blockly
var workspace: object;

// Arduino-simulation
var simulation: ArduinoSimulation = new ArduinoSimulation();

// Tab-handler for the sidebar
var tabhandler: TabHandler;

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
	
	// Gets the simulation-preview element
	const simPrevElm = S("#simulationPreview");


	// Performs the ui-setup
	tabhandler = setupUi().tabhandler;
	
	// Inits all custom blockly-fields
	registerCustomFields();

	// Initalizes all blockly-stuff
	workspace = registerBlockly();

  	// Adds all event's
	// TODO
	S("#genCode").onclick = onGenCodeClicked;

	// Attaches the simulation
	simulation.attachToPreview(simPrevElm);

}