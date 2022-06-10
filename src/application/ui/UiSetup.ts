import { Environment } from "../Environment.js";
import { Error } from "../errorSystem/Errors.js";
import { InAppErrorSystem } from "../errorSystem/InAppErrorSystem.js";
import { getFromLanguage, setupLanguageManager } from "../language/LanguageManager.js";
import { PopupSystem } from "./popupSystem/PopupSystem.js";
import { PRESET_SOURCECODE } from "../Preset.js";
import { ArduinoSimulation } from "../simulation/ArduinoSimulation.js";
import { Min, PositiveNumber } from "../types/Types.js";
import { loadSVG } from "../utils/SVGUtil.js";
import { TAB_PREVIEW_ANIMATION, TAB_PREVIEW_CODE, TAB_PREVIEW_ANALYTICS, TAB_CONTROLS_ENVS, TAB_CONTROLS_VARS, TAB_CONTROLS_SETTINGS } from "./Tabs.js";
import { SliderBar, SliderBarDirection } from "./utils/SliderBar.js";
import { TabHandler } from "./utils/TabHandler.js";
import { PREVIEWS_FILE_PATH, PREVIEWS, DEFAULT_PREVIEW_NAME, setupEnvironment } from "./utils/UiEnvironmentIntegration.js";
import { S } from "./utils/UiUtils.js";
import { Manager as SettingsUiManager } from "../blockly/settingsui/SettingsUI.js";

// Executes to setup the ui
// Returns an object with all important elements

/**
 * Setups the ui-environment
 * 
 * @param onSettingsChange callback that executes every time a critical part of the ui changes (Meaning a part that affects the final code or animation, eg. env or submenu of blocks)
 * 
 * @returns an object with all generated element for the ui or false if an error occurred
 * setting up the ui. If an error occurres it's only required to stop further init-code as
 * the error will already be displayed inside the ui.
 */
export async function setupUi(onSettingsChange: ()=>void){

    try{
        // Setups the language-system
        await setupLanguageManager("en_us");

        registerSliderBars();
        
        // Gets specific elements
        var codeArea = setupCodeArea();
        var runtimeDisplay = S("#runtime",S("#analyticsTab")) as HTMLSpanElement;
        var blocklyArea = S("#blocklyDiv") as HTMLDivElement;

        var popupsystem = setupPopupsystem();
        var simulation = await setupArduinoSimulation();
        var errorsystem = new InAppErrorSystem();        
        
        SettingsUiManager.attachToUI(S("#blockly-settingsui") as HTMLDivElement, onSettingsChange);

        // Builds the environment
        var env = new Environment(simulation.getLedAmount() as any as Min<1>,true,PRESET_SOURCECODE,0 as PositiveNumber, DEFAULT_PREVIEW_NAME);
        
        // Binds the environment-settings to the ui
        setupEnvironment(env,popupsystem,simulation,onSettingsChange);
        
        // Setups the tabs
        var previewTabHandler = registerPreviewTabs();
        var controlTabHandler = registerControlsTabs();
        
        // Cleans all hidden popup-content
        popupsystem.closePopup();



        // Closes the loading-screen
        removeLoadingScreen();
    
        return {
            previewTabHandler,
            controlTabHandler,
            popupsystem,
            simulation,
            environment: env,
            errorsystem,
            codeArea,
            runtimeDisplay,
            blocklyArea
        };
    }catch(error){
        displayLoadingError(error as Error);
        return false;
    }

}


//#region Setup-functions

// Setups the code-area and returns it
function setupCodeArea() : HTMLTextAreaElement{
    // Gets the area
    var codeArea = S("#codeArea") as HTMLTextAreaElement;

    // Binds display
    codeArea.placeholder = getFromLanguage("ui.tabs.preview.code.textarea.placeholder");

    return codeArea;
}

// Displays the given error inside the ui
function displayLoadingError(error: any){
    try{
        // Gets the components
        var ls = S("#loadingScreen");
        var status = S("#status",ls);
        var display = S("#infoDisplay",ls);

        // Adds the styles
        ls.classList.add("error");

        // Updates the messages
        status.textContent = "Error loading application.";
        display.textContent = "We failed to initalize the application. Please try to restart it. Below is the error message that we retreived:\n\n"+(error as Error).message;

        // Logs the error
        console.error(error);        

    }catch(e){
        console.error("App crashed while handling critical error: ", e, "Inital error: ",error);

        // Uses the last tool known to men that now can notify the user.
        alert("Oh no. It seams the app has crashed while handling an initalization error. please restart it.");
    }

}

// Removes the ui-loading screen
function removeLoadingScreen(){
    // Removes the loading-class from the body
    document.body.classList.remove("loadingScreen");

    // Gets the loading-screen
    var ls = S("#loadingScreen");
    
    // Lets the loading-screen slowly disapear
    ls.classList.add("disapear");

    // Fully hides the loading-screen after the disapear-animation is over
    setTimeout(()=>ls.classList.add("hide"), 2000);
}

// Setups the arduino-simulation and inserts it into the environment
async function setupArduinoSimulation(){

    // Creates the simulation with the preview-element
    var simulation = new ArduinoSimulation(S("#animationTab"));

    // Loads the first preview
    simulation.loadPreview(await loadSVG(PREVIEWS_FILE_PATH+DEFAULT_PREVIEW_NAME+".svg"));

    return simulation;
}

// Setups the popups and popupsystem
function setupPopupsystem(){
	// Gets the code-editor element
	var codeEditElm = S("#precompEditor");


	// Creates the popupsystem
    var popsys = new PopupSystem();

    // Appends the event handler to the control-button
	var editCodeBtn = S("#inpPreCode") as HTMLInputElement;
    editCodeBtn.value = getFromLanguage("ui.settings.edit-button");
    editCodeBtn.addEventListener("click",()=>popsys.showPopup(codeEditElm));

	return popsys;
}

// Registers the controls tabs for the below sidebar
function registerControlsTabs(){
     // Gets the controls-area
     var controls = S("#controls");

     // Gets the tabs and binds their texts
     var btnTabEnv = S("#btnTabEnv",controls) as HTMLInputElement;
     btnTabEnv.value = getFromLanguage("ui.tabs.controls.env");
 
     var btnTabVars = S("#btnTabVars",controls) as HTMLInputElement;
     btnTabVars.value = getFromLanguage("ui.tabs.controls.vars");
 
     var btnTabSettings = S("#btnTabSettings",controls) as HTMLInputElement;
     btnTabSettings.value = getFromLanguage("ui.tabs.controls.settings");
     
     // Creates the tab-buttons
     const BUTTONS: [HTMLElement,number][] = [
         [btnTabEnv,TAB_CONTROLS_ENVS],
         [S("#tabEnv",controls),TAB_CONTROLS_ENVS],
         [btnTabVars,TAB_CONTROLS_VARS],
         [S("#tabVars",controls),TAB_CONTROLS_VARS],
         [btnTabSettings,TAB_CONTROLS_SETTINGS],
         [S("#tabSettings",controls),TAB_CONTROLS_SETTINGS]
     ];
     
     // Gets the tabs
     const TABS: [HTMLElement,number][] = [
         [S("#envTab",controls),TAB_CONTROLS_ENVS],
         [S("#varsTab",controls),TAB_CONTROLS_VARS],
         [S("#settingsTab",controls),TAB_CONTROLS_SETTINGS]
     ]
 
     return new TabHandler(controls,BUTTONS,TABS,TAB_CONTROLS_ENVS);
}

// Registers the tabs that show different pre-view's in the above sidebar
function registerPreviewTabs(){

    // Gets the sidebar-preview
    var preview = S("#preview");

    // Gets the tabs and binds their texts
    var btnTabCode = S("#btnTabCode",preview) as HTMLInputElement;
    btnTabCode.value = getFromLanguage("ui.tabs.preview.code");

    var btnTabAnimation = S("#btnTabAnimation",preview) as HTMLInputElement;
    btnTabAnimation.value = getFromLanguage("ui.tabs.preview.animation");

    var btnTabAnalytics = S("#btnTabAnalytics",preview) as HTMLInputElement;
    btnTabAnalytics.value = getFromLanguage("ui.tabs.preview.analytics");
    
    // Creates the tab-buttons
    const BUTTONS: [HTMLElement,number][] = [
        [btnTabCode,TAB_PREVIEW_CODE],
        [S("#tabCode",preview),TAB_PREVIEW_CODE],
        [btnTabAnimation,TAB_PREVIEW_ANIMATION],
        [S("#tabAnimation",preview),TAB_PREVIEW_ANIMATION],
        [btnTabAnalytics,TAB_PREVIEW_ANALYTICS],
        [S("#tabAnalytics",preview),TAB_PREVIEW_ANALYTICS]
    ];

    // Handle the code-tab
    var codeTab = S("#codeTab",preview);
    handleTabCode(codeTab as HTMLDivElement);
    
    // Gets the tabs
    const TABS: [HTMLElement,number][] = [
        [codeTab,TAB_PREVIEW_CODE],
        [S("#animationTab",preview),TAB_PREVIEW_ANIMATION],
        [S("#analyticsTab",preview),TAB_PREVIEW_ANALYTICS]
    ]

    return new TabHandler(S(".tabHandler",preview),BUTTONS,TABS,TAB_PREVIEW_ANIMATION);
}

// Inits the tab-code
function handleTabCode(tabCode: HTMLDivElement){
    // Gets the text-area
    var textArea = S("textarea",tabCode) as HTMLTextAreaElement;

    // Gets the copy-button and registers the event-handler
    var cpBtn = S("#copy",tabCode) as HTMLInputElement
    cpBtn.value = getFromLanguage("ui.tabs.preview.code.copy-button");
    cpBtn.addEventListener("click",()=>navigator.clipboard.writeText(textArea.value));
}


// Registers the sliders
function registerSliderBars(){
    SliderBar.register(S("#controls"), S(".sliderbar.y"), 50, 500, SliderBarDirection.DIRECTION_Y_BACKWARD);
    SliderBar.register(S("#sidebar"),S(".sliderbar.x"), 50, 800, SliderBarDirection.DIRECTION_X_BACKWARD);
}

//#endregion