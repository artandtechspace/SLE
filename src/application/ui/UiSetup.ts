import { Environment } from "../Environment.js";
import { PopupSystem } from "../popupSystem/PopupSystem.js";
import { PRESET_SOURCECODE } from "../Preset.js";
import { ArduinoSimulation } from "../simulation/ArduinoSimulation.js";
import { SliderBar, SliderBarDirection } from "./utils/SliderBar.js";
import { TabHandler } from "./utils/TabHandler.js";
import { S } from "./utils/UiUtils.js";

// Executes to setup the ui
// Returns an object with all important elements
export async function setupUi(){
    registerSliderBars();
    registerSidebarIconChanger();

    var popupsystem = setupPopupsystem();
    var tabhandler = registerSidebarTabs();
    var simulation = await setupArduinoSimulation();

    // Builds the environment
    var env = new Environment(simulation.getLedAmount(),true,PRESET_SOURCECODE,1);

    // Binds the environment-settings to the ui
    bindEnvironment(env,popupsystem);

    // Cleans all hidden popup-content
    popupsystem.closePopup();

    return {
        tabhandler,
        popupsystem,
        simulation,
        environment: env
    };
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
	const simPrevElm = S("#simulationPreview");

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

    // Gets the general tab-buttons
    const TAB_BUTTONS: HTMLElement[] = [
        ...S("#texts").children as unknown as HTMLElement[],
        ...S("#icons").children as unknown as HTMLElement[]
    ];

    return new TabHandler(TAB_BUTTONS,document.querySelectorAll(".tab") as unknown as HTMLElement[],1);
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