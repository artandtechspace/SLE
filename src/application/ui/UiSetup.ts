import { Environment } from "../Environment.js";
import { Error } from "../errorSystem/Errors.js";
import { InAppErrorSystem } from "../errorSystem/InAppErrorSystem.js";
import { getFromLanguage, setupLanguageManager } from "../language/LanguageManager.js";
import { PopupSystem } from "./popupSystem/PopupSystem.js";
import { PRESET_SOURCECODE } from "../Preset.js";
import { ArduinoSimulation } from "../simulation/ArduinoSimulation.js";
import { Min, PositiveNumber } from "../types/Types.js";
import { loadSVG } from "../utils/SVGUtil.js";
import { TAB_ANIMATION, TAB_CODE, TAB_ANALYTICS } from "./Tabs.js";
import { SliderBar, SliderBarDirection } from "./utils/SliderBar.js";
import { TabHandler } from "./utils/TabHandler.js";
import { PREVIEWS_FILE_PATH, PREVIEWS, DEFAULT_PREVIEW_NAME, setupEnvironment } from "./utils/UiEnvironmentIntegration.js";
import { S } from "./utils/UiUtils.js";

// Executes to setup the ui
// Returns an object with all important elements

/**
 * Setups the ui-environment
 * 
 * @param onEnvChange callback that executes every time a environment-variable changes
 * 
 * @returns an object with all generated element for the ui or false if an error occurred
 * setting up the ui. If an error occurres it's only required to stop further init-code as
 * the error will already be displayed inside the ui.
 */
export async function setupUi(onEnvChange: ()=>void){

    try{
        // Setups the language-system
        await setupLanguageManager("en_us");

        registerSliderBars();
        
        // Gets specific elements
        var codeArea = setupCodeArea();
        var runtimeDisplay = S("#runtime",S("#analyticsTab")) as HTMLSpanElement;
        var blocklyArea = S("#blocklyDiv") as HTMLDivElement;

        var popupsystem = setupPopupsystem();
        var tabhandler = registerSidebarTabs();
        var simulation = await setupArduinoSimulation();
        var errorsystem = new InAppErrorSystem();
    
        // Builds the environment
        var env = new Environment(simulation.getLedAmount() as any as Min<1>,true,PRESET_SOURCECODE,0 as PositiveNumber, DEFAULT_PREVIEW_NAME);
    
        // Binds the environment-settings to the ui
        setupEnvironment(env,popupsystem,simulation,onEnvChange);
    
        // Cleans all hidden popup-content
        popupsystem.closePopup();



        // Closes the loading-screen
        removeLoadingScreen();
    
        return {
            tabhandler,
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
    codeArea.placeholder = getFromLanguage("ui.tabs.code.textarea.placeholder");

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


// Registers the sidebar-tabs and logic
function registerSidebarTabs(){

    // Gets the sidebar-preview
    var preview = S("#preview");

    // Gets the tabs and binds their texts
    var btnTabCode = S("#btnTabCode",preview) as HTMLInputElement;
    btnTabCode.value = getFromLanguage("ui.tabs.code");

    var btnTabAnimation = S("#btnTabAnimation",preview) as HTMLInputElement;
    btnTabAnimation.value = getFromLanguage("ui.tabs.animation");

    var btnTabAnalytics = S("#btnTabAnalytics",preview) as HTMLInputElement;
    btnTabAnalytics.value = getFromLanguage("ui.tabs.analytics");
    
    // Creates the tab-buttons
    const BUTTONS: [HTMLElement,number][] = [
        [btnTabCode,TAB_CODE],
        [S("#tabCode",preview),TAB_CODE],
        [btnTabAnimation,TAB_ANIMATION],
        [S("#tabAnimation",preview),TAB_ANIMATION],
        [btnTabAnalytics,TAB_ANALYTICS],
        [S("#tabAnalytics",preview),TAB_ANALYTICS]
    ];

    // Handle the code-tab
    var codeTab = S("#codeTab",preview);
    handleTabCode(codeTab as HTMLDivElement);
    
    // Gets the tabs
    const TABS: [HTMLElement,number][] = [
        [codeTab,TAB_CODE],
        [S("#animationTab",preview),TAB_ANIMATION],
        [S("#analyticsTab",preview),TAB_ANALYTICS]
    ]

    return new TabHandler(S(".tabHandler",preview),BUTTONS,TABS,1);
}

// Inits the tab-code
function handleTabCode(tabCode: HTMLDivElement){
    // Gets the text-area
    var textArea = S("textarea",tabCode) as HTMLTextAreaElement;

    // Gets the copy-button and registers the event-handler
    var cpBtn = S("#copy",tabCode) as HTMLInputElement
    cpBtn.value = getFromLanguage("ui.tabs.code.copy-button");
    cpBtn.addEventListener("click",()=>navigator.clipboard.writeText(textArea.value));
}


// Registers the sliders
function registerSliderBars(){
    SliderBar.register(S("#controls"), S(".sliderbar.y"), 50, 500, SliderBarDirection.DIRECTION_Y_BACKWARD);
    SliderBar.register(S("#sidebar"),S(".sliderbar.x"), 50, 800, SliderBarDirection.DIRECTION_X_BACKWARD);
}

//#endregion