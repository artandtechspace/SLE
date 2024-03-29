import { ModuleCode } from "../codegenerator/CodeGenerator";
import { Arduino } from "../simulation/Arduino";
import { OpenObject, PositiveNumber } from "../types/Types";
import { FunctionGenerator } from "../codegenerator/variablesystem/CppFuncGenerator";
import { FunctionSupplier } from "../codegenerator/variablesystem/CppFuncSupplier";
import { VariableSystem } from "../codegenerator/variablesystem/VariableSystem";

/**
 * The module-base is the element that takes in a configuration file and generate the code based on the provided information and environment.
 */

export abstract class ModuleBase<Config extends OpenObject>{
    
    //#region Code-generation

    /**
     * Here will the modules-code be generated. This takes the user-defined environment @param env, a variable-system @param varSys to requests it's variables,
     * the defined config @param config, a function-supply that can be used to get call's for function that got registered inside the
     * registerFunction-method and finally the isDirty-Flag @param isDirty that tells th e generator if there are still some led's that didn't get pushed to the stripe.
     * 
     * This @returns {ModuleCode} which contains all opationally loop-code, setup-code and again the is-dirty flag.
     */
    public generateCode(varSys: VariableSystem, config: Config, funcSup: FunctionSupplier, isDirty: boolean): ModuleCode{
        return {}
    }

    /**
     * This method is used to register cpp-function that shall be called by the module
     */
    public registerFunction(config: Config, funcGen: FunctionGenerator){}


    //#endregion


    //#region Simulation

    /**
     * Runs once at the begining to simulate the setup of for the module als time intensiv calculations should be done here.
     * 
     * @param config the configuration for the module
     * @param singleSourceOfTruth an object that is also passed to the loop function. Use this to store internal variables and append validated configurations that are required inside the loop method.
     * @param arduino the arduino-simulatio object. Can be used to await a delay or push stuff
     */
    public simulateSetup(config: Config, singleSourceOfTruth: OpenObject, arduino: Arduino){}
    
    /**
     * Runs once at the begining to simulate the setup of for the module als time intensiv calculations should be done here.
     * 
     * @param config the configuration for the module
     * @param singleSourceOfTruth an object that was also passed to the setup function. Use this to store internal variables and append validated configurations that are required inside the loop method.
     * @param arduino the arduino-simulatio object. Can be used to await a delay or push stuff
     */
    public async simulateLoop(config: Config, singleSourceOfTruth: OpenObject, arduino: Arduino){}

    //#endregion

    //#region Module-infos

    /**
     * Takes in some settings and returns informations about the given config
     */
    public calculateRuntime(config: Config) : number{
        return 0;
    }

    /**
     * Takes in some settings and return the highest index (from 0 including) of any led ever accessed by the given config.
     * If nothing is returned, it is assumed that the module doesn't used the leds
     */
    public calculateMaxAccessedLed(config: Config): PositiveNumber | void {}

    //#endregion 

}