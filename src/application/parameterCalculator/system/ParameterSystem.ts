import { LoadingError, ParameterError } from "../../errorSystem/Errors.js";
import { TAB_CONTROLS_PARAMS } from "../../ui/Tabs.js";
import { isNumberEV, isObjectEV, isStringEV } from "../../utils/ElementValidation.js";
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

// Returns all parameters as an array of objects with name:value pairs
export function exportParameters(){
    // Prepares the parameters
    var parameters = PSModel.getUParameters().map(prm=>{
        return {
            "name": prm.name,
            "value": prm.value
        }
    });

    return parameters;
}

/**
 * Loads the given parameters-array as new parameters into the model.
 * Please ensure that the given parameters are actually valid (using the validateParamConfig-method) before this one.
 * @param params the parameters to import
 */
export function importParameters(params: {name: string, value: number}[]){
    // Removes all user-parameters
    PSModel.deleteAllUParameters();

    // Imports the new parameters
    for(var prm of params)
        PSModel.createUserParameter(prm.name, prm.value);

    // Reloads the view from the model
    PSView.reloadViewFromModel();
}

/**
 * Takes in an element as the parameter-config-array
 * and values it.
 * If not error is thrown, the config is valid and the elements can be loaded using the
 * importParameters-method
 * @param params the parameter-config element
 * 
 * @throws {LoadingError} if anything is invalid with the params-element
 */
export function validateParamConfig(params: []) {

    // Validates the parameters
    var validParams = params.every((prm: any)=>isObjectEV(prm) && isStringEV(prm.name) && isNumberEV(prm.value));

    if(!validParams)
        // TODO: Add language lookup
        throw new LoadingError("The given parameters have an unknown format.");
}