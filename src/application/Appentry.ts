import registerCustomFields from "./blockly/fields/FieldRegistry.js";
import { generateCode } from "./codegenerator/CodeGenerator.js";
import { DesyncedWorkspaceError, Error } from "./errorSystem/Errors.js";
import { InAppErrorSystem } from "./errorSystem/InAppErrorSystem.js";
import { getFullRuntime, getOutOfBoundsModExports } from "./modules/ModuleUtils.js";
import { PopupSystem } from "./ui/popupSystem/PopupSystem.js";
import { ArduinoSimulation } from "./simulation/ArduinoSimulation.js";
import { ConfigBuilder, ModBlockExport } from "./ConfigBuilder.js";
import { TAB_PREVIEW_ANALYTICS, TAB_PREVIEW_ANIMATION, TAB_PREVIEW_CODE } from "./ui/Tabs.js";
import { setupUi } from "./ui/UiSetup.js";
import { TabHandler } from "./ui/utils/TabHandler.js";
import { BlockWarning } from "./errorSystem/Warnings.js";
import { didWorkspaceChange, setWorkspaceInvalid } from "./blockly/util/WorkspaceChangeDetector.js";
import { Manager as SettingsUiManager } from "./blockly/settingsui/SettingsUI.js";
import { getEnvironment, getWorkspace, initSharedObjects } from "./SharedObjects.js";
import { writeEnvironmentToPage } from "./ui/utils/UiEnvironmentIntegration.js";
import { checkParametersForErrors } from "./parameterCalculator/system/ParameterSystem.js";
import { Language } from "./language/LanguageManager.js";

// Arduino-simulation
var simulation: ArduinoSimulation;

// Tab-handlers for the sidebar
var previewTabHandler: TabHandler;
var controlTabHandler: TabHandler;

// Popupsystem
var popsys: PopupSystem;

// Error-system
var errsys: InAppErrorSystem;

// Timeout-handler for blockly-compilations
var compileTimeout: NodeJS.Timeout | undefined;


// Some specific html-references
var codeArea: HTMLTextAreaElement; // Holds the generated source-code
var runtimeDisplay: HTMLSpanElement; // Holds how long the given configuration will run



/**
 * Gets the root block from the workspace.
 * 
 * @throws {DesyncedWorkspaceError} If there are multiple non-disabled blocks or non-disabled and non-root blocks
 */
function getRootBlock(){
	// Gets all blocks that
	var blocks = getWorkspace().getTopBlocks().filter((block:any)=>!block.disabled);

	// Checks the length
	if(blocks.length <= 0)
		// TODO: Add language lookup
		throw new DesyncedWorkspaceError("No root-block found. Did something go wrong while loading?");

	// Checks the length
	if(blocks.length > 1)
		// Checks if there is one block beeing dragged
		if(!getWorkspace().isDragging())
			// TODO: Add language lookup
			throw new DesyncedWorkspaceError("Found multiple non-disabled blocks on the workspace. Did something go wrong while loading?");
	
	
	// Gets the block
	var blg = blocks[0];

	// Ensures that the block is the root
	if(blg.type !== "sle_root")
		// TODO: Add language lookup
		throw new DesyncedWorkspaceError("Found a single non-root block on the workspace but nothing else. Did something go wrong while loading?");

	return blg;
}

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
		// Resets the timeout-variable
		compileTimeout = undefined;

		try{

			// Ensures that there are no errors with any parameters
			checkParametersForErrors();

			// Ensures that only the root element exists on the workspace
			var rootBlock = getRootBlock().getNextBlock();

			// Gets the raw string config
			var modExports: ModBlockExport<any>[] = ConfigBuilder.generateModuleExports(rootBlock);
			
			// Checks if the checksum has changed
			if(!didWorkspaceChange(modExports) && !ignoreNoChanges)
				return;

			// Checks what to do
			switch(previewTabHandler.getSelectedTab()){
				case TAB_PREVIEW_ANIMATION:
					// Starts the simulation
					simulation.startSimulation(modExports);
					break;
				case TAB_PREVIEW_CODE:
					// Generates the code and appends it to the code-area
					codeArea.value = generateCode(modExports);
					break;
				case TAB_PREVIEW_ANALYTICS:
					// Generates the runtime-analytics
					runtimeDisplay.textContent = Language.get(
						"ui.tabs.preview.analytics.runtime",
						getFullRuntime(modExports)/1000
					);
					break;
			}
			

			// Checks if any module would shoot over the specified led-amount
			var oobMods = getOutOfBoundsModExports(modExports);

			// Checks if there are any out of bounds mods
			if(oobMods.length > 0){
				// Gets the first problem
				var prob = oobMods[0];
				// Writes the warning
				// TODO: Add language lookup
				errsys.show(new BlockWarning(`Your settings (${prob.ledIndex+1} leds) for a block are overflowing your led-stripe's (${getEnvironment().ledAmount} leds) length.`,prob.block));
			}else
				// Removes and previous error-messages
				errsys.clearScreen();			
		}catch(e){
			// Stops the simulation and removes and elements
			simulation.stopSimulation();
			codeArea.value="";
			runtimeDisplay.textContent = "[x]";

			// Sets the block-checksum to invalid
			setWorkspaceInvalid();
	
			// Ensures that the error is from the error-system
			if(!(e instanceof Error)){
				console.error(e);
				alert("We have detected a critical error, please restart the application.");
				return;
			}

			// Shows the error
			errsys.show(e);
		}
	}
}


// Eventhandler for blockly-events
function onBlocklyChange(evt: any){
	// Executes the blockly-block menu if a block get's selected
	if(evt.type==="selected"){
		SettingsUiManager.onBlockSelect(getWorkspace().getBlockById(evt.newElementId))
		return;
	}

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
	// Resets some elements
	codeArea.value="";
	runtimeDisplay.textContent="";

	// Requests a recompilation to update the tab
	requestBlocklyWsCompilation(true);
}

// Event: When a new environment get's loaded
function onNewEnvLoaded(){
	// Updates the ui
	writeEnvironmentToPage(getEnvironment(), true);
	// Recompiles
	requestBlocklyWsCompilation(true);
	// Removes focus from the settings-ui
	SettingsUiManager.onBlockSelect(null);
}


/**
 * Gets called once the general environment for the app got setup. Eg. the electron browser-window or the inbrowser setup got done.
 */
export default async function onAppInitalize(){
	// Inits all custom blockly-fields
	registerCustomFields();
	
	// Performs the ui-setup
	var cfg = await setupUi(()=>requestBlocklyWsCompilation(true));

	// Checks if there was an error while initalizing the app
	if(cfg === false)
		return;

	// Stores all variables
	previewTabHandler = cfg.previewTabHandler;
	controlTabHandler = cfg.controlTabHandler;
	popsys = cfg.popupsystem;
	simulation = cfg.simulation;
	errsys = cfg.errorsystem;
	codeArea = cfg.codeArea;
	runtimeDisplay = cfg.runtimeDisplay;

	// Appends the tab-change event
	previewTabHandler.setTabChangeHandler(onTabChange);

	// Registers the change-handler for blockly
	cfg.blocklyWorkspace.addChangeListener(onBlocklyChange);

	// Inits the shared objects
	initSharedObjects(cfg.blocklyWorkspace, cfg.environment, onNewEnvLoaded);
}