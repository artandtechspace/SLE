import { ParameterError } from "../../errorSystem/Errors.js";
import { TAB_CONTROLS_PARAMS } from "../../ui/Tabs.js";
import { PSModel, PSView } from "./internal/ParameterSystemController.js";


// Inits the parameter system and it's ui (Shall be called during the ui-setup)
export function startParameterSystem(tableBody: HTMLElement, onParameterChange: ()=>void){
    // Starts the model
    PSModel.init();

    // Binds the view to the page
    PSView.bindToPage(tableBody, onParameterChange);
}

// Event: When the tab of the control with the parameter-system-view changes
export function onRenderTab(id: number){
    if(id === TAB_CONTROLS_PARAMS)
        // Updates the system-parameters on the view
        PSView.updateSystemParameters();
}

// Checks if there are currently any errors and if so, throw the appropriat exception
export function checkParametersForErrors(){

    // Refreshes the errors
    PSModel.checkForErrors();

    var errors = PSModel.getErrorParameters();

    // Checks if no errors occured
    if(errors.length <= 0)
        return;

    // Only looks at one error at a time
    var err = errors[0];
    
    // Gets the error-parameter
    var prm = PSModel.getUParameterByInstanceId(err.instanceId)!;
    
    // Throws the error
    throw ParameterError.of(err.type,prm);
}