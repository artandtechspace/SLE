import { Config } from "../Config.js";
import { Environment } from "../Environment.js";
import { Arduino } from "../simulation/Arduino.js";
import { VariableSystem } from "../variablesystem/VariableSystem.js";
import { ModuleReturn } from "./ModuleReturn.js";

/**
 * The module-base is the element that takes in a configuration file and generate the code based on the provided information and environment.
 */

export class ModuleBase{
    /**
     * This function is here to generate the code for the Arduino/MC.
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

    //#region Simulation

    /**
     * Runs once at the begining to simulate the setup of for the module als time intensiv calculations should be done here.
     * 
     * @param env the environment 
     * @param config the configuration for the module
     * @param singleSourceOfTruth an object that is also passed to the loop function. Use this to store internal variables and append validated configurations that are required inside the loop method.
     * @param arduino the arduino-simulatio object. Can be used to await a delay or push stuff
     */
    public simulateSetup(env : Environment, config: Config, singleSourceOfTruth: {[k: string]: any}, arduino: Arduino){}
    
    /**
     * Runs once at the begining to simulate the setup of for the module als time intensiv calculations should be done here.
     * 
     * @param env the environment 
     * @param singleSourceOfTruth an object that is also passed to the loop function. Use this to store internal variables or already calculated configurations and so on.
     * @param arduino the arduino-simulatio object. Can be used to await a delay or push stuff
     */
    public async simulateLoop(env : Environment, singleSourceOfTruth: {[k: string]: any}, arduino: Arduino){}

    //#endregion

    //#region Module-infos

    /**
     * Takes in some settings and returns informations about the given config
     */
    public calculateRuntime(env: Environment, config: Config) : number{
        return 0;
    }

    //#endregion 

}