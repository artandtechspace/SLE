import { getEnvironment, getWorkspace, loadNewEnvironment } from "../SharedObjects";
import {Environment} from "../Environment";
import { LoadingError } from "../errorSystem/Errors";
import { OpenObject } from "../types/Types";
import { isArrayEV, isObjectEV } from "../utils/ElementValidation";
import { exportParameters, importParameters, validateParamConfig } from "../parameterCalculator/system/ParameterSystem";

const Blockly = require("blockly");

// Export-strings
const exportStringEnv = "environment";
const exportStringWs = "workspace";
const exportStringParameters = "parameters";

// Exports the current workspace to a string that can also again be loaded by the importFromString-function
export function exportToString(){
    // Exports the workspace
    var wsExp = Blockly.serialization.workspaces.save(getWorkspace());

    // Exports the environment
    var env = Environment.serialize(getEnvironment());

    // Exports the parameters
    var params = exportParameters();

    return JSON.stringify({
        [exportStringEnv]: env,
        [exportStringWs]: wsExp,
        [exportStringParameters]: params
    });
}


/**
 * Tries to import the given string @param data as a project
 * @throws {LoadingError|SerialisationError} if the data is invalid
 */
export function importFromString(data: string){
    // Tries to parse
    var parsedJson: OpenObject;
    try{
        parsedJson = JSON.parse(data);
    }catch(exc){
        throw new LoadingError("import.error.jsonparse");
    }


    // Checks if the workspace is given
    if(!isObjectEV(parsedJson[exportStringWs]))
        throw new LoadingError("import.error.json.workspace");


    // Checks the environment and tries to parse it
    if(!isObjectEV(parsedJson[exportStringEnv]))
        throw new LoadingError("import.error.json.environment");

    var env: Environment = Environment.deserialize(parsedJson[exportStringEnv]);
        
        

    var params = parsedJson[exportStringParameters];
        
    // Validates the parameters-element
    if(!isArrayEV(params))
        throw new LoadingError("import.error.json.parameters");
    
    // Validates the config and throws an error if the config is invalid
    validateParamConfig(params);

    // Tries to load the workspace
    try{
        Blockly.serialization.workspaces.load(parsedJson[exportStringWs], getWorkspace());
    }catch(exc){
        throw new LoadingError("import.error.json.workspace")
    }

    // Loads the env
    loadNewEnvironment(env);

    // Loads the parameters
    importParameters(params);
}