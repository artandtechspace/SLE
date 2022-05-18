import { Environment } from "../Environment.js";
import { VariableSystem } from "../codegenerator/variablesystem/VariableSystem.js";
import { ModuleBase } from "../modules/ModuleBase.js";
import { printIf as pif } from "../utils/WorkUtils.js";
import { generateModuleCode, ModuleCode } from "../codegenerator/CodeGenerator.js";
import { Arduino } from "../simulation/Arduino.js";
import { getFullRuntime } from "../modules/ModuleUtils.js";
import { ModBlockExport } from "../ConfigBuilder.js";
import { Min, OpenObject } from "../types/Types.js";
import { FunctionGenerator } from "../codegenerator/variablesystem/CppFuncGenerator.js";
import { FunctionSupplier } from "../codegenerator/variablesystem/CppFuncSupplier.js";

export type LoopModuleConfig = {
    submodules: ModBlockExport<any>[],
    repeats: Min<2>
}

class LoopModule_ extends ModuleBase<LoopModuleConfig> {
    
    // Default config
    public readonly DEFAULT_CONFIG: LoopModuleConfig = {
        submodules: [],
        repeats: 2 as Min<2>
    }

    public registerFunction(env: Environment, config: LoopModuleConfig, funcGen: FunctionGenerator): void {
        // Registers all functions for the submodules
        config.submodules.forEach(mod=>mod.module.registerFunction(env,mod.config,funcGen));
    }

    public generateCode(env: Environment, varSys: VariableSystem, cfg: LoopModuleConfig, funcSup: FunctionSupplier, isDirty: boolean): ModuleCode {
         // Gets the generated codes (The execution may end here do to an error beeing thrown)
         var generatedCode:ModuleCode = generateModuleCode(env,varSys,cfg.submodules, funcSup, isDirty);

         // Requests the local variable
         var vItr = varSys.requestLocalVariable("int","i","0");
 
         // Generates the new loop code
         var loopCode = `
             for(${vItr.declair()} ${vItr} < ${cfg.repeats}; ${vItr}++){
                 ${generatedCode.loop ?? ""}${pif(
                     "FastLED.show();", generatedCode.isDirty as boolean
                 )}
             }
         `;
 
         return {
             setup: generatedCode.setup,
             loop: loopCode,
             isDirty: false
         };
    }

    public calculateRuntime(env: Environment, cfg: LoopModuleConfig) : number {
        return getFullRuntime(env, cfg.submodules) * cfg.repeats;
    }



    public simulateSetup(env : Environment, cfg: LoopModuleConfig, singleSourceOfTruth: OpenObject, arduino: Arduino){
        // Simulates the setup for the submodules
        var mods = cfg.submodules.map(mod=>{
            // Generates the new module-object
            var modObj = {
                ...mod,
                ssot: {}
            };

            // Executes the setup
            modObj.module.simulateSetup(env,modObj.config,modObj.ssot,arduino);

            return modObj;
        });

        // Stores the module-configs for the loop-simulation
        singleSourceOfTruth.mods = mods;

        // Stores the require settings too
        singleSourceOfTruth.repeats = cfg.repeats;
    }

    public async simulateLoop(env : Environment, config: LoopModuleConfig, singleSourceOfTruth: {[k: string]: any}, arduino: Arduino){
        // Gets the mods
        var mods = singleSourceOfTruth.mods as (ModBlockExport<any> & {ssot: {}})[];

        // Executes the loop
        for(var x = 0; x < singleSourceOfTruth.repeats; x++){

            // Executes the loop for the modules
            for(var modObj of mods)
                await modObj.module.simulateLoop(env, modObj.config,modObj.ssot,arduino);
        }
    }
}

export const LoopModule = new LoopModule_();