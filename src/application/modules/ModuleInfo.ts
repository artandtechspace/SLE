import { Config } from "../Config.js";
import { Environment } from "../Environment.js";
import { ModuleBase } from "./ModuleBase.js";

export interface ModuleInfo{
    runtime: number
}

/**
 * Returns the combined infos of all given modules
 * @param env the environment
 * @param mods the modules
 * @returns some informations like the estimated runtime in millis
 */
export function getModuleInfos(env: Environment, mods: [ModuleBase, Config][]) : ModuleInfo{
    // Calculates the runtime of all modules
    var runtime = mods.map(([mod, cfg])=> mod.calculateCodeInfos(env, cfg).runtime).reduce((a,b)=>a+b,0);

    return {
        runtime
    }
}