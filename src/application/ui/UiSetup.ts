import { Environment } from "../Environment";
import { Error } from "../errorSystem/Errors";
import { InAppErrorSystem } from "../errorSystem/InAppErrorSystem";
import { PopupSystem } from "./popupSystem/PopupSystem";
import { PRESET_SOURCECODE } from "../Preset";
import { ArduinoSimulation } from "../simulation/ArduinoSimulation";
import { Min, PositiveNumber } from "../types/Types";
import { loadSVG } from "../utils/SVGUtil";
import { TAB_PREVIEW_ANIMATION, TAB_PREVIEW_CODE, TAB_PREVIEW_ANALYTICS, TAB_CONTROLS_ENVS, TAB_CONTROLS_PARAMS } from "./Tabs";
import { TabHandler } from "./utils/TabHandler";
import { PREVIEWS_FILE_PATH, DEFAULT_PREVIEW_NAME, setupEnvironment } from "./utils/UiEnvironmentIntegration";
import { S, SM } from "./utils/UiUtils";
import { Manager as SettingsUiManager } from "../blockly/settingsui/SettingsUI";
import { registerBlockly } from "../blockly/BlocklyRegister";
import { onRenderTab, startParameterSystem } from "../parameterCalculator/system/ParameterSystem";
import { Language } from "../language/LanguageManager";
import { getApi } from "../apiWrapper/APIWrapper";
import { convertMenuToHTML } from "./menubar/MenubarBuilder";
import { createMenu } from "./menubar/Menu";

const Split = require("split.js");

// Executes to setup the ui
// Returns an object with all important elements

/**
 * Setups the ui-environment
 * 
 * @param doRecompile callback that executes every time a critical part of the ui changes (Meaning a part that affects the final code or animation, eg. env or submenu of blocks)
 * 
 * @returns an object with all generated element for the ui or false if an error occurred
 * setting up the ui. If an error occurres it's only required to stop further init-code as
 * the error will already be displayed inside the ui.
 */
export async function setupUi(doRecompile: ()=>void){

    try{
        // Setups the language-system
        await Language.setup("de_de");

        // Initalizes all blockly-stuff and init's the blockly-area
        var workspace = registerBlockly(S("#blocklyDiv") as HTMLDivElement);

        // Registers the slider-bars for the sidebar tabs
        prepareSplitters();

        prepareHeader();
        
        // Gets specific elements
        var codeArea = setupCodeArea();
        var analytics = getAnalyticsDisplay();

        var popupsystem = setupPopupsystem();
        var simulation = await setupArduinoSimulation();
        var errorsystem = new InAppErrorSystem();        
        
        SettingsUiManager.attachToUI(S("#blockly-settingsui") as HTMLDivElement, doRecompile);

        // Builds the environment
        var env = new Environment(
            undefined /* Unsaved project / Unknown save-path */,
            Language.get("ui.header.project.defaultname"),
            simulation.getLedAmount() as any as Min<1>,
            true,
            PRESET_SOURCECODE,
            0 as PositiveNumber,
            DEFAULT_PREVIEW_NAME
        );
        
        // Binds the environment-settings to the ui
        setupEnvironment(env,popupsystem,simulation,doRecompile);

        // Setups the parameter-system
        var paramSys = setupParameterSystem(doRecompile);
        
        // Setups the tabs
        var previewTabHandler = registerPreviewTabs();
        var controlTabHandler = registerControlsTabs();

        // Cleans all hidden popup-content
        popupsystem.closePopup();

        // Prepares some very basic html-page stuff
        prepareHtmlPage();

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
            analytics,
            blocklyWorkspace: workspace,
            paramSys
        };
    }catch(error){
        displayLoadingError(error as Error);
        return false;
    }

}


//#region Setup-functions

function prepareHeader(){

    // Gets the header
    var header = S("header");

    // Adds the image-link
    var img = S("img", header);
    
    // Adds the url-open event to the image
    img.onclick=()=>getApi().openURL("https://github.com/artandtechspace/SLE");


    // Gets the menubar-base
    var menubar = S(".menubar", header);

    // Creates and appends the menu
    menubar.append(...convertMenuToHTML(createMenu()));
}

function prepareSplitters(){

    Split.default(['#preview', '#controls'], {
        direction: 'vertical',
        sizes: [70, 30],
        minSize: [150, 42],
        gutterSize: 3
    });

    Split.default(['#mainArea', '#sidebar'], {
        sizes: [80, 20],
        minSize: 0,
        snapOffset: [20,130],
        gutterSize: 3
    });

     
   // Adds a children to every gutter
   // This is used to spread the area that the gutter can be dragged
   // from without making a bigger gutter. Useful for touch-screen devices
   for(var gutter of SM(".gutter") as any as HTMLElement[])
        gutter.appendChild(document.createElement("div"));
}

// Prepares some very basic html-page stuff
function prepareHtmlPage(){
    // Prevents the user from accidentally existing the page without saving
    window.onbeforeunload = getApi().onBeforeClosing;
}

// Returns all elements required for the analytics display
function getAnalyticsDisplay(){
    // Gets the shell of the displays
    var shell = S("#analyticsTab");

    return {
        setup: S("#runtime-setup",shell) as HTMLParagraphElement,
        loop: S("#runtime-loop",shell) as HTMLParagraphElement,
    }
}

// Setups the parameter-system
function setupParameterSystem(onParameterChange: ()=>void){
    // Gets the table-body element for the parameter system
    var tbody = S("tbody",S("#paramsTab"));

    // Creates the parameter system
    startParameterSystem(tbody, onParameterChange);
}

// Setups the code-area and returns it
function setupCodeArea() : HTMLTextAreaElement{
    // Gets the area
    return S("#codeArea") as HTMLTextAreaElement;
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

        // Notifyes the user using the api
        getApi().showErrorMessage("Initalize-error", "Oh no. It seams the app has crashed while handling an initalization error. please restart it.")
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

/**
 * Setups the arduino-simulation and inserts it into the environment
 * 
 * @throws any error that could arrise
 */
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
    editCodeBtn.addEventListener("click",()=>popsys.showPopup(codeEditElm));

	return popsys;
}

// Registers the controls tabs for the below sidebar
function registerControlsTabs(){
    // Gets the controls-area
    var controls = S("#controls");

    // Creates the tab-buttons
    const BUTTONS: [HTMLElement,number][] = [
        [S("#btnTabEnv",controls),TAB_CONTROLS_ENVS],
        [S("#tabEnv",controls),TAB_CONTROLS_ENVS],
        [S("#btnTabParams",controls),TAB_CONTROLS_PARAMS],
        [S("#tabParams",controls),TAB_CONTROLS_PARAMS]
    ];
    
    // Gets the tabs
    const TABS: [HTMLElement,number][] = [
        [S("#envTab",controls),TAB_CONTROLS_ENVS],
        [S("#paramsTab",controls),TAB_CONTROLS_PARAMS]
    ]
 
    var handler = new TabHandler(controls,BUTTONS,TABS,TAB_CONTROLS_ENVS);

    // Adds the change handler
    handler.setTabChangeHandler(onRenderTab);

    return handler;
}

// Registers the tabs that show different pre-view's in the above sidebar
function registerPreviewTabs(){

    // Gets the sidebar-preview
    var preview = S("#preview");

    // Creates the tab-buttons
    const BUTTONS: [HTMLElement,number][] = [
        [S("#btnTabCode",preview),TAB_PREVIEW_CODE],
        [S("#tabCode",preview),TAB_PREVIEW_CODE],
        [S("#btnTabAnimation",preview),TAB_PREVIEW_ANIMATION],
        [S("#tabAnimation",preview),TAB_PREVIEW_ANIMATION],
        [S("#btnTabAnalytics",preview),TAB_PREVIEW_ANALYTICS],
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
    cpBtn.addEventListener("click",()=>navigator.clipboard.writeText(textArea.value));
}

//#endregion