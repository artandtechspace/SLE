import { Environment } from "../Environment.js";
import { Error } from "../errorSystem/Error.js";
import { InAppErrorSystem } from "../errorSystem/InAppErrorSystem.js";
import { PopupSystem } from "../popupSystem/PopupSystem.js";
import { PRESET_SOURCECODE } from "../Preset.js";
import { ArduinoSimulation } from "../simulation/ArduinoSimulation.js";
import { TAB_ANIMATION, TAB_CODE, TAB_JSON } from "./Tabs.js";
import { SliderBar, SliderBarDirection } from "./utils/SliderBar.js";
import { TabHandler } from "./utils/TabHandler.js";
import { S } from "./utils/UiUtils.js";

// Executes to setup the ui
// Returns an object with all important elements

/**
 * Setups the ui-environment
 * 
 * @returns an object with all generated element for the ui or false if an error occurred
 * setting up the ui. If an error occurres it's only required to stop further init-code as
 * the error will already be displayed inside the ui.
 */
export async function setupUi(){

    try{
        registerSliderBars();
        registerSidebarIconChanger();
    
        var popupsystem = setupPopupsystem();
        var tabhandler = registerSidebarTabs();
        var simulation = await setupArduinoSimulation();
        var errorsystem = new InAppErrorSystem();
    
        // Builds the environment
        var env = new Environment(simulation.getLedAmount(),true,PRESET_SOURCECODE,1);
    
        // Binds the environment-settings to the ui
        bindEnvironment(env,popupsystem);
    
        // Cleans all hidden popup-content
        popupsystem.closePopup();

        // Closes the loading-screen
        removeLoadingScreen();
    
        return {
            tabhandler,
            popupsystem,
            simulation,
            environment: env,
            errorsystem
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
        while(true)
            alert("Oh no. It seams the app has crashed while handling an initalization error. please restart it.");
    }

}

// Removes the ui-loading screen
function removeLoadingScreen(){
    // Removes the loading-screen
    S("#loadingScreen").classList.add("hide");
}

// The environment-binder takes in the reference to an environment and binds to the ui
function bindEnvironment(env: Environment, popsys: PopupSystem){
    // Gets all elements to bind to
    var ctrl = S("#controls") as any;;
    var inpPin = S("#inpPin",ctrl) as any;
    var inpAmt = S("#inpAmt",ctrl) as any;
    var inpComments = S("#inpComments",ctrl) as any;
    var inpPreCode = S("#inpPreCode",ctrl) as any;

	// Gets the code-editor element's
	var codeEditorPopup = S("#precompEditor") as any;
    var codeEditor = S("textarea",codeEditorPopup) as any;
    var btnSave = S("#pce-save",codeEditorPopup) as any;
    var btnCancle = S("#pce-cancle",codeEditorPopup) as any;

    // Sets the default values
    inpPin.value = env.ledPin;
    inpAmt.value = env.ledAmount;
    inpComments.checked = env.withComments;


    // Adds the event-handlers
    inpPin.addEventListener("change",(_: any)=>env.ledPin=inpPin.value);
    inpAmt.addEventListener("change",(_: any)=>env.ledAmount=inpAmt.value);
    inpComments.addEventListener("change",(_: any)=>env.withComments=inpComments.checked);
    inpPreCode.addEventListener("click",(_: any)=>{
        popsys.showPopup(codeEditorPopup);
        codeEditor.value = env.preprocessingCode;
    });
    btnCancle.addEventListener("click",popsys.closePopup);
    btnSave.addEventListener("click",(_: any)=>{
        env.preprocessingCode = codeEditor.value;
        popsys.closePopup();
    });

}

// Setups the arduino-simulation and inserts it into the environment
async function setupArduinoSimulation(){

    // Creates the simulation
    var simulation = new ArduinoSimulation();

	// Gets the simulation-preview element
	const simPrevElm = S("#animationTab");

    // Attaches to the simulation
    await simulation.attachToPreview(simPrevElm);

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
        [S("#btnTabJson",btns),TAB_JSON],
        [S("#tabJson",icons),TAB_JSON]
    ];

    // Gets the tabs
    const TABS: [HTMLElement,number][] = [
        [S("#codeTab",tabs),TAB_CODE],
        [S("#animationTab",tabs),TAB_ANIMATION],
        [S("#jsonTab",tabs),TAB_JSON]
    ]

    return new TabHandler(BUTTONS,TABS,1);
}


// Registers the sliders
function registerSliderBars(){
    SliderBar.register(S("#controls"), S(".sliderbar.y"), 250, 500, SliderBarDirection.DIRECTION_Y_BACKWARD);
    SliderBar.register(S("#sidebar"),S(".sliderbar.x"), 50, 500, SliderBarDirection.DIRECTION_X_BACKWARD);
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