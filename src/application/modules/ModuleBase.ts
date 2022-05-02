import { Config } from "../Config.js";
import { Environment } from "../Environment.js";
import { Arduino } from "../simulation/Arduino.js";
import { VariableSystem } from "../variablesystem/VariableSystem.js";
import { ModuleInfo } from "./ModuleInfo.js";
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
     * @throws {ModuleError} if there is an error
     * 
     */
    public generateCode(env : Environment, varSys : VariableSystem, config: Config, isDirty: boolean) : ModuleReturn{
        return {}
    }

    /**
     * Takes in some settings and returns informations about the given config
     */
    public calculateCodeInfos(env: Environment, config: Config) : ModuleInfo {
        return {
            runtime: 0
        }
    }

    // TODO
    public simulateSetup(env : Environment, config: Config, singleSourceOfTruth: {[k: string]: any}, arduino: Arduino){}
    public async simulateLoop(env : Environment, singleSourceOfTruth: {[k: string]: any}, arduino: Arduino){}
}