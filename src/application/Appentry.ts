// Import
import { parseConfigsFromBlocks } from "./blockly/BlocklyUtils.js";
import { registerBlockly } from "./blockly/BlockRegister.js";
import registerCustomFields from "./blockly/fields/FieldRegistry.js";
import { tryParseModules } from "./codegenerator/ConfigValidator.js";
import { Config } from "./Config.js";
import { Environment } from "./Environment.js";
import { ModuleBase } from "./modules/ModuleBase.js";
import { PopupSystem } from "./popupSystem/PopupSystem.js";
import { PRESET_SOURCECODE } from "./Preset.js";
import { ArduinoSimulation } from "./simulation/ArduinoSimulation.js";
import { setupUi } from "./ui/UiSetup.js";
import { TabHandler } from "./ui/utils/TabHandler.js";
import { hash53b } from "./utils/CryptoUtil.js";
const Blockly = require("blockly");

// Global environment
var env: Environment;

// Workspace for blockly
var workspace: object;

// Arduino-simulation
var simulation: ArduinoSimulation;

// Tab-handler for the sidebar
var tabhandler: TabHandler;

// Popupsystem
var popsys: PopupSystem;



// Checksum of the previous blockly-configuration
var blocklyChecksum: number = 0;

// Eventhandler for blockly-events
function onBlocklyChange(evt: any){

	// Ignores all changes that are not drag or ending block-change events
	// If the event is undefined this will be treated as the init-event
	if(evt !== undefined &&(evt.type !== "drag" || evt.isStart) && evt.type !== "change")
		return;
	
	try{
		// Gets the raw string config
		var rawCfg = Blockly.JavaScript.workspaceToCode(workspace);

		// Generates the checksum
		var csum: number = hash53b(rawCfg);
		
		// Checks if the checksum has changed
		if(csum === blocklyChecksum)
			return;

		// Parses the config from the workspace
		var cfg: [] = parseConfigsFromBlocks(rawCfg);	
	
		// Updates the checksum
		blocklyChecksum = csum;
	
		// Tries to parse all modules
		var mods: [ModuleBase, Config][] = tryParseModules(cfg);
	
		// Restarts the simulation
		simulation.startSimulation(new Environment(20,false,"",2),mods);

		// Removes and previous error-messages

	}catch(e){

		// TODO
		console.log("Cought error");
		console.log(e);
		
		return;
	}

	
}


/**
 * Gets called once the general environment for the app got setup. Eg. the electron browser-window or the inbrowser setup got done.
 */
export default async function onAppInitalize(){
	// Performs the ui-setup
	var cfg = await setupUi();

	// Checks if there was an error while initalizing the app
	if(cfg === false)
		return;

	// Stores all variables
	tabhandler = cfg.tabhandler;
	popsys = cfg.popupsystem;
	simulation = cfg.simulation;
	env = cfg.environment;



	// Inits all custom blockly-fields
	registerCustomFields();

	// Initalizes all blockly-stuff
	workspace = registerBlockly();
	
	// Registers the change-handler for blockly
	(workspace as any).addChangeListener(onBlocklyChange);
}