import { getEnvironment, getWorkspace, loadNewEnvironment } from "../SharedObjects.js";
import {Environment} from "../Environment.js";
import { LoadingError } from "../errorSystem/Errors.js";
import { OpenObject } from "../types/Types.js";

const Blockly = require("blockly");

// Export-strings
const exportStringEnv = "environment";
const exportStringWs = "workspace";

// Exports the current workspace to a string that can also again be loaded by the importFromString-function
export function exportToString(){
    // Exports the workspace
    var wsExp = Blockly.serialization.workspaces.save(getWorkspace());

    // Exports the environment
    var env = Environment.serialize(getEnvironment());

    return JSON.stringify({
        [exportStringEnv]: env,
        [exportStringWs]: wsExp
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
        throw new LoadingError("Failed to parse-file.");
    }

    // Small function to verify an object
    const isObj = (obj:any)=>typeof obj === "object" && obj.constructor.name === "Object";

    // Ensures the elements are set
    if(!isObj(parsedJson[exportStringEnv]) || !isObj(parsedJson[exportStringWs]))
        throw new LoadingError("Invalid workspace or environment.");

    var env: Environment = Environment.deserialize(parsedJson[exportStringEnv]);

    // Tries to load the workspace
    try{
        Blockly.serialization.workspaces.load(parsedJson[exportStringWs], getWorkspace());
    }catch(exc){
        throw new LoadingError("Invalid workspace.")
    }
    // Loads the env
    loadNewEnvironment(env);
}