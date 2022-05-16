import { ModuleCode } from "../codegenerator/CodeGenerator.js";
import { Environment } from "../Environment.js";
import { Arduino } from "../simulation/Arduino.js";
import { OpenObject, PositiveNumber } from "../types/Types.js";
import { FunctionGenerator } from "../variablesystem/CppFuncGenerator.js";
import { FunctionSupplier } from "../variablesystem/CppFuncSupplier.js";
import { VariableSystem } from "../variablesystem/VariableSystem.js";

/**
 * The module-base is the element that takes in a configuration file and generate the code based on the provided information and environment.
 */

export abstract class ModuleBase<Config extends OpenObject>{
    
    //#region Code-generation

    public generateCode(env: Environment, varSys: VariableSystem, config: Config, funcSup: FunctionSupplier, isDirty: boolean): ModuleCode{
        return {}
    }

    public registerFunction(env: Environment, config: Config, funcGen: FunctionGenerator){}


    //#endregion


    //#region Simulation

    /**
     * Runs once at the begining to simulate the setup of for the module als time intensiv calculations should be done here.
     * 
     * @param env the environment 
     * @param config the configuration for the module
     * @param singleSourceOfTruth an object that is also passed to the loop function. Use this to store internal variables and append validated configurations that are required inside the loop method.
     * @param arduino the arduino-simulatio object. Can be used to await a delay or push stuff
     */
    public simulateSetup(env : Environment, config: Config, singleSourceOfTruth: OpenObject, arduino: Arduino){}
    
    /**
     * Runs once at the begining to simulate the setup of for the module als time intensiv calculations should be done here.
     * 
     * @param env the environment 
     * @param singleSourceOfTruth an object that is also passed to the loop function. Use this to store internal variables or already calculated configurations and so on.
     * @param arduino the arduino-simulatio object. Can be used to await a delay or push stuff
     */
    public async simulateLoop(env : Environment, config: Config, singleSourceOfTruth: OpenObject, arduino: Arduino){}

    //#endregion

    //#region Module-infos

    /**
     * Takes in some settings and returns informations about the given config
     */
    public calculateRuntime(env: Environment, config: Config) : number{
        return 0;
    }

    /**
     * Takes in some settings and return the highest index (from 0 including) of any led ever accessed by the given config.
     * If nothing is returned, it is assumed that the module doesn't used the leds
     */
    public calculateMaxAccessedLed(env: Environment, config: Config): PositiveNumber | void {}

    //#endregion 

}