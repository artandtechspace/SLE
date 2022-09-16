import { VariableSystem } from "../codegenerator/variablesystem/VariableSystem";
import { ModuleBase } from "../modules/ModuleBase";
import { printIf as pif } from "../utils/WorkUtils";
import { generateModuleCode, ModuleCode } from "../codegenerator/CodeGenerator";
import { Arduino } from "../simulation/Arduino";
import { getFullRuntime } from "../modules/ModuleUtils";
import { ModBlockExport } from "../ConfigBuilder";
import { Min, OpenObject } from "../types/Types";
import { FunctionGenerator } from "../codegenerator/variablesystem/CppFuncGenerator";
import { FunctionSupplier } from "../codegenerator/variablesystem/CppFuncSupplier";

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

    public registerFunction(config: LoopModuleConfig, funcGen: FunctionGenerator): void {
        // Registers all functions for the submodules
        config.submodules.forEach(mod=>mod.module.registerFunction(mod.config,funcGen));
    }

    public generateCode(varSys: VariableSystem, cfg: LoopModuleConfig, funcSup: FunctionSupplier, isDirty: boolean): ModuleCode {
         // Gets the generated codes (The execution may end here do to an error beeing thrown)
         var generatedCode:ModuleCode = generateModuleCode(varSys,cfg.submodules, funcSup, isDirty);

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

    public calculateRuntime(cfg: LoopModuleConfig) : number {
        return getFullRuntime(cfg.submodules) * cfg.repeats;
    }



    public simulateSetup(cfg: LoopModuleConfig, singleSourceOfTruth: OpenObject, arduino: Arduino){
        // Simulates the setup for the submodules
        var mods = cfg.submodules.map(mod=>{
            // Generates the new module-object
            var modObj = {
                ...mod,
                ssot: {}
            };

            // Executes the setup
            modObj.module.simulateSetup(modObj.config,modObj.ssot,arduino);

            return modObj;
        });

        // Stores the module-configs for the loop-simulation
        singleSourceOfTruth.mods = mods;

        // Stores the require settings too
        singleSourceOfTruth.repeats = cfg.repeats;
    }

    public async simulateLoop(config: LoopModuleConfig, singleSourceOfTruth: {[k: string]: any}, arduino: Arduino){
        // Gets the mods
        var mods = singleSourceOfTruth.mods as (ModBlockExport<any> & {ssot: {}})[];

        // Executes the loop
        for(var x = 0; x < singleSourceOfTruth.repeats; x++){

            // Executes the loop for the modules
            for(var modObj of mods)
                await modObj.module.simulateLoop(modObj.config,modObj.ssot,arduino);
        }
    }
}

export const LoopModule = new LoopModule_();