import { Config } from "../Config.js";
import { Environment } from "../Environment.js";
import { VariableSystem } from "../variablesystem/VariableSystem.js";
import { ModuleReturn } from "./ModuleReturn.js";

/**
 * The module-base is the element that takes in a configuration file and generate the code based on the provided information and environment.
 */

export class ModuleBase{
    /**
     * This function is here to generate the code for the Arduino/Mc.
     * 
     * It returns an object with the following properties:
     * {
     * (Optional) setup: a string with the mc. setup-code that shall run once. If the function-type is start-only this is a required function.
     * loop: a string with the mc. loop-code that can continuesly run in the loop. If the generator-type is set to start-only this will be ignored.
     * 
     * }
     * 
     */
    public generateCode(env : Environment, varSys : VariableSystem, config: Config) : string|ModuleReturn{
        return {}
    }
}