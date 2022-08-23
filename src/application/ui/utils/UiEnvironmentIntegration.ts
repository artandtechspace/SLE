import { Environment } from "../../Environment.js";
import { PopupSystem } from "../popupSystem/PopupSystem.js";
import { ArduinoSimulation } from "../../simulation/ArduinoSimulation.js";
import { Min, PositiveNumber } from "../../types/Types.js";
import { create as C } from "../../utils/HTMLBuilder.js";
import { loadSVG } from "../../utils/SVGUtil.js";
import { S } from "./UiUtils.js";
import { getEnvironment } from "../../SharedObjects.js";
import { Language } from "../../language/LanguageManager.js";


/**
 * Responsible for integrating the environment-objects into the ui (Loading and Storing)
 */


// Path to the preview-files
export const PREVIEWS_FILE_PATH = "resources/arduinoPreviews/";

// Holds the file-names for every known preview (Without the .svg extensions)
export const PREVIEWS: string[] = [
    "Googles",
    "WS2812B-8x1",
    "WS2812B-8x2",
    "WS2812B-8x3",
    "WS2812B-8x4",
    "Ring-16-pxl",
    "Ring-8-pxl"
]

// Default element for the preview
export const DEFAULT_PREVIEW_NAME = PREVIEWS[0];


// Last/Preview selected index of the preview-picker
var selectedIndex: number;

// The loaded environment-integration-collection with these elements
var envIntCol: EnvIntegrationCollection;


/**
 * Setups the environment
 */
 export function setupEnvironment(env: Environment, popsys: PopupSystem, sim: ArduinoSimulation, onEnvChange: ()=>void){
    // Loads all elements
    envIntCol = loadEnvIntegrationCollection();

    // Binds events etc.
    bindEnvironment(sim, popsys, onEnvChange);

    // Writes the first environment
    writeEnvironmentToPage(env);
}





/**
 * Collection with all elements that are required for the environment integration into the page.
 */
interface EnvIntegrationCollection {
    readonly pin: any/*Input-numeric*/,
    readonly amt: any/*Input-numeric*/
    readonly comments: any/*Input-checkbox*/,
    readonly precodeBtn: any/*Input-button*/,
    readonly previewSelect: HTMLSelectElement,
    
    readonly codeeditor: {
        readonly popup: HTMLDivElement
        readonly editor: HTMLTextAreaElement,
        readonly saveBtn: HTMLInputElement,
        readonly cancleBtn: HTMLInputElement,
    }
};

/**
 * Loads all env-integration elements from the document.
 * 
 * @returns an object with all objects well and structured
 */
function loadEnvIntegrationCollection() : EnvIntegrationCollection{

    // Temp wrappers
    var ctrl = S("#controls") as HTMLDivElement;
    var codePopup = S("#precompEditor") as HTMLDivElement;

    return {
        pin: S("#inpPin",ctrl) as HTMLInputElement,
        amt: S("#inpAmt",ctrl) as HTMLInputElement,
        comments: S("#inpComments",ctrl) as HTMLInputElement,
        precodeBtn: S("#inpPreCode",ctrl) as HTMLInputElement,
        previewSelect:  S("#inpSelect",ctrl) as HTMLSelectElement,
        
        codeeditor: {
            popup: codePopup,
            editor: S("textarea",codePopup) as HTMLTextAreaElement,
            saveBtn: S("#pce-save",codePopup) as HTMLInputElement,
            cancleBtn: S("#pce-cancle",codePopup) as HTMLInputElement,
        }
    }
}

/**
 * Takes in the environment and the environment-integration-collction and applies the new values
 */
export function writeEnvironmentToPage(env: Environment, withUpdate = false){
    envIntCol.amt.value = env.ledAmount;
    envIntCol.pin.value = env.ledPin;
    envIntCol.comments.checked = env.withComments;

    // Updates the index of the selected preview
    for(let i=0; i<envIntCol.previewSelect.children.length; i++){
        // Gets the child
        var cld = envIntCol.previewSelect.children[i];

        // Checks if the value matches
        if((cld as HTMLOptionElement).value === env.selectedPreview){
            // Updates the index
            envIntCol.previewSelect.selectedIndex = i;
            break;
        }
    }

    // Fires the change event
    if(withUpdate)
        envIntCol.previewSelect.dispatchEvent(new Event("change"));
}

/**
 * Takes in multiple required elements and bind the document-environment with all events and initalizsation stuff
 */
function bindEnvironment(sim: ArduinoSimulation, popsys: PopupSystem, onEnvChange: ()=>void){
    
    // Adds event below
    envIntCol.pin.addEventListener("change",(_: any)=>{
        getEnvironment().ledPin=envIntCol.pin.valueAsNumber as PositiveNumber;
        onEnvChange();
    });
    envIntCol.amt.addEventListener("change",(_: any)=>{
        getEnvironment().ledAmount=envIntCol.amt.valueAsNumber as Min<1>
        onEnvChange();
    });
    envIntCol.comments.addEventListener("change",(_: any)=>{
        getEnvironment().withComments=envIntCol.comments.checked
        onEnvChange();
    });
    envIntCol.precodeBtn.addEventListener("click",(_: any)=>{
        popsys.showPopup(envIntCol.codeeditor.popup);
        envIntCol.codeeditor.editor.value = getEnvironment().preprocessingCode;
    });

    // Adds codeeditor events
    envIntCol.codeeditor.cancleBtn.addEventListener("click",popsys.closePopup);
    envIntCol.codeeditor.saveBtn.addEventListener("click",(_: any)=>{
        getEnvironment().preprocessingCode = envIntCol.codeeditor.editor.value
        popsys.closePopup();
        onEnvChange();
    });


    // Appends all preview-options for the animation
    for(var file of PREVIEWS){
        
        // Creates the option
        envIntCol.previewSelect.appendChild(C("option",{
            text: Language.get("ui.settings.preview-image.values."+file.toLowerCase()),
            attr: {
                value: file
            }
        }));
    }

    // Adds preview-events
    envIntCol.previewSelect.addEventListener("change",async()=>{        
        
        // Gets the env
        var env = getEnvironment();

        try{
            // Gets the new index
            var newIndex = envIntCol.previewSelect.selectedIndex;
            // Gets the new filename
            var filename = envIntCol.previewSelect.selectedOptions[0].getAttribute("value") as string;
            
            // Prevents changing the index (To not change the index before actually loading the image. This is usedful in case of an error while loading the image)
            envIntCol.previewSelect.selectedIndex = selectedIndex;            

            // Gets the new animation and tries to load it
            var svg = await loadSVG(PREVIEWS_FILE_PATH+filename+".svg");
            sim.loadPreview(svg);

            // Updates the led-amount
            env.ledAmount = sim.getLedAmount();
            env.selectedPreview = filename;

            // Updates the index
            envIntCol.previewSelect.selectedIndex = selectedIndex = newIndex;

            // Writes the changes to the page
            writeEnvironmentToPage(env);

            // Executes the callback
            onEnvChange();
        }catch(e){
            // Displays the error to the user
            // TODO: Implement using popup-system
            alert(e);
        }
    });
}