// Import
import { parseConfigsFromBlocks, registerBlockly } from "./blockly/BlockRegister.js";
import registerCustomFields from "./blockly/fields/FieldRegistry.js";
import { tryParseModules } from "./codegenerator/ConfigValidator.js";
import { Environment } from "./Environment.js";
import { ArduinoSimulation } from "./simulation/ArduinoSimulation.js";
import { setupUi } from "./ui/UiSetup.js";
import { TabHandler } from "./ui/utils/TabHandler.js";
import { hash53b } from "./utils/CryptoUtil.js";
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

// Checksum of the previous blockly-configuration
var blocklyChecksum: number = 0;

// Eventhandler for blockly-events
function onBlocklyChange(evt: any){

	// Ignores all changes that are not drag or ending block-change events
	// If the event is undefined this will be treated as the init-event
	if(evt !== undefined &&(evt.type !== "drag" || evt.isStart) && evt.type !== "change")
		return;
	
	var cfg;
	try{
		// Parses the config from the workspace
		cfg = parseConfigsFromBlocks(Blockly.JavaScript.workspaceToCode(workspace));
	}catch(e){

		// TODO
		console.log("Cought error");
		console.log(e);
		
		return;
	}

	// Generates the checksum
	var csum = hash53b(JSON.stringify(cfg));	

	// Checks if the checksum has changed
	if(csum === blocklyChecksum)
		return;

	// Updates the checksum
	blocklyChecksum = csum;

	var mods = tryParseModules(cfg);

	// Checks if an error got found
	if(typeof mods === "string"){
		// TODO
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
	
	// Registers the change-handler for blockly
	(workspace as any).addChangeListener(onBlocklyChange);


	// Attaches the simulation
	simulation.attachToPreview(simPrevElm);

}