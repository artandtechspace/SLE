// Import
import { parseConfigsFromBlocks } from "./blockly/BlocklyUtils.js";
import { registerBlockly } from "./blockly/BlockRegister.js";
import registerCustomFields from "./blockly/fields/FieldRegistry.js";
import { generateCode } from "./codegenerator/CodeGenerator.js";
import { tryParseModules } from "./codegenerator/ConfigValidator.js";
import { Config } from "./Config.js";
import { Environment } from "./Environment.js";
import { Error } from "./errorSystem/Error.js";
import { InAppErrorSystem } from "./errorSystem/InAppErrorSystem.js";
import { ModuleBase } from "./modules/ModuleBase.js";
import { PopupSystem } from "./popupSystem/PopupSystem.js";
import { ArduinoSimulation } from "./simulation/ArduinoSimulation.js";
import { TAB_ANIMATION, TAB_CODE } from "./ui/Tabs.js";
import { setupUi } from "./ui/UiSetup.js";
import { TabHandler } from "./ui/utils/TabHandler.js";
import { S } from "./ui/utils/UiUtils.js";
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

// Error-system
var errsys: InAppErrorSystem;

// Timeout-handler for blockly-compilations
var compileTimeout: NodeJS.Timeout | undefined;


// Holds the generated source-code
var codeArea: HTMLTextAreaElement;

/**
 * Requests a compilation of the blockly-workspace and to restart the animation.
 * If this function is called multiple times in a very short time, only one function will execute.
 * 
 * If @param ignoreNoChanges is false blockly wont restart the animation if there were no changes found.
 * 
 */
function requestBlocklyWsCompilation(ignoreNoChanges=false){
	
	// Checks if there is already a compilation on their way
	if(compileTimeout !== undefined)
		return;
	
	// Inits the compilation
	compileTimeout = setTimeout(compileWs, 50);

	// Actual function to compile the workspace
	function compileWs(){
		console.log("Compiled workspace");
		
		// Resets the timeout-variable
		compileTimeout = undefined;

		try{
			// Gets the raw string config
			var rawCfg = Blockly.JavaScript.workspaceToCode(workspace);		
	
			// Generates the checksum
			var csum: number = hash53b(rawCfg);			
	
			// Checks if the checksum has changed
			if(csum === blocklyChecksum && !ignoreNoChanges)
				return;
	
			// Parses the config from the workspace
			var cfg: [] = parseConfigsFromBlocks(rawCfg);
			
		
			// Updates the checksum
			blocklyChecksum = csum;
		
			// Tries to parse all modules
			var mods: [ModuleBase, Config][] = tryParseModules(cfg);
		
			// Checks what to do
			switch(tabhandler.getSelectedTab()){
				case TAB_ANIMATION:
					// Starts the simulation
					simulation.startSimulation(env,mods);
					break;
				case TAB_CODE:
					// Generates the code and appends it to the code-area
					codeArea.value = generateCode(env,mods);
					break;
			}
	
			// Removes and previous error-messages
			errsys.removeError();
			
		}catch(e){
			// Stops the simulation and removes the code
			simulation.stopSimulation();
			codeArea.value="";

			// Sets the block-checksum to invalid
			blocklyChecksum = 0;
	
			// Ensures that the error is from the error-system
			if(!(e instanceof Error)){
				alert("We have detected a critical error, please restart the application.");
				return;
			}
					

			// Shows the error
			errsys.writeError(e);
		}
	}
}


// Checksum of the previous blockly-configuration
var blocklyChecksum: number = 0;

// Eventhandler for blockly-events
function onBlocklyChange(evt: any){
	// Ignores all changes that are not drag, delete or ending block-change events
	// If the event is undefined this will be treated as the init-event
	if(evt !== undefined && (evt.type !== "drag" || evt.isStart) && evt.type !== "change" && evt.type !== "delete")
		return;
	
	// Starts to compile the blockly workspace
	requestBlocklyWsCompilation();
}

// Event: When the tab-view changes
function onTabChange(tabId: number){
	// Stops the animation
	simulation.stopSimulation();
	// Resets the code-area
	codeArea.value="";

	// Checks if the code should be regenerated
	if(tabId === TAB_CODE || tabId === TAB_ANIMATION)
		requestBlocklyWsCompilation(true);
}


/**
 * Gets called once the general environment for the app got setup. Eg. the electron browser-window or the inbrowser setup got done.
 */
export default async function onAppInitalize(){
	// Performs the ui-setup
	var cfg = await setupUi(()=>requestBlocklyWsCompilation(true));

	// Checks if there was an error while initalizing the app
	if(cfg === false)
		return;

	// Stores all variables
	tabhandler = cfg.tabhandler;
	popsys = cfg.popupsystem;
	simulation = cfg.simulation;
	env = cfg.environment;
	errsys = cfg.errorsystem;
	codeArea = cfg.codeArea;

	// Appends the tab-change event
	tabhandler.setTabChangeHandler(onTabChange);


	// Inits all custom blockly-fields
	registerCustomFields();

	// Initalizes all blockly-stuff
	workspace = registerBlockly();
	
	// Registers the change-handler for blockly
	(workspace as any).addChangeListener(onBlocklyChange);
}