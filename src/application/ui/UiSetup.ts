import { Environment } from "../Environment.js";
import { Error } from "../errorSystem/Error.js";
import { InAppErrorSystem } from "../errorSystem/InAppErrorSystem.js";
import { PopupSystem } from "../popupSystem/PopupSystem.js";
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
        registerSliderBars();
        registerSidebarIconChanger();
        
        // Gets specific elements
        var codeArea = S("#codeArea") as HTMLTextAreaElement;
        var runtimeDisplay = S("#runtime",S("#analyticsTab")) as HTMLSpanElement;

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
            runtimeDisplay
        };
    }catch(error){
        displayLoadingError(error as Error);
        return false;
    }

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
    // Removes the loading-screen
    S("#loadingScreen").classList.add("hide");
}

// Setups the arduino-simulation and inserts it into the environment
async function setupArduinoSimulation(){

    // Creates the simulation with the preview-element
    var simulation = new ArduinoSimulation(S("#animationTab"));

    // Loads the first preview
    simulation.loadPreview(await loadSVG(PREVIEWS_FILE_PATH+DEFAULT_PREVIEW_NAME));

    return simulation;
}

// Setups the popups and popupsystem
function setupPopupsystem(){
	// Gets the code-editor element
	var codeEditElm = S("#precompEditor");


	// Creates the popupsystem
    var popsys = new PopupSystem();

    // Appends the event handler to the control-button
	S("#inpPreCode").addEventListener("click",()=>popsys.showPopup(codeEditElm));
    

	return popsys;
}


// Registers the sidebar-tabs and logic
function registerSidebarTabs(){

    // Gets the parents
    var btns = S("#texts");
    var icons = S("#icons");
    var tabs = S("#tabs");
    
    // Creates the tab-buttons
    const BUTTONS: [HTMLElement,number][] = [
        [S("#btnTabCode",btns),TAB_CODE],
        [S("#tabCode",icons),TAB_CODE],
        [S("#btnTabAnimation",btns),TAB_ANIMATION],
        [S("#tabAnimation",icons),TAB_ANIMATION],
        [S("#btnTabAnalytics",btns),TAB_ANALYTICS],
        [S("#tabAnalytics",icons),TAB_ANALYTICS]
    ];

    // Handle the code-tab
    var codeTab = S("#codeTab",tabs);
    handleTabCode(codeTab as HTMLDivElement);
    
    // Gets the tabs
    const TABS: [HTMLElement,number][] = [
        [codeTab,TAB_CODE],
        [S("#animationTab",tabs),TAB_ANIMATION],
        [S("#analyticsTab",tabs),TAB_ANALYTICS]
    ]

    return new TabHandler(BUTTONS,TABS,1);
}

// Inits the tab-code
function handleTabCode(tabCode: HTMLDivElement){
    // Gets the text-area
    var textArea = S("textarea",tabCode) as HTMLTextAreaElement;

    // Gets the copy-button and registers the event-handler
    S("#copy",tabCode).addEventListener("click",()=>navigator.clipboard.writeText(textArea.value));
}


// Registers the sliders
function registerSliderBars(){
    SliderBar.register(S("#controls"), S(".sliderbar.y"), 50, 500, SliderBarDirection.DIRECTION_Y_BACKWARD);
    SliderBar.register(S("#sidebar"),S(".sliderbar.x"), 50, 800, SliderBarDirection.DIRECTION_X_BACKWARD);
}



// Registers the resize listener that handle the change from text to icons for the sidebar when it get's to small
function registerSidebarIconChanger(){

    // Creates the observer
    var res = new ResizeObserver(entries=>{

        // Iterates over all changes
        for (let entry of entries) {
            // Gets the parent
            var parent = entry.target.parentElement as HTMLElement;

            // Checks if some texts have already been moved to the second line
            if(entry.contentRect.height > entry.target.children[0].clientHeight)
                parent.classList.add("hide");
            else
                parent.classList.remove("hide");
        }
    });

    // Registers the listener
    res.observe(S("#texts"));
}