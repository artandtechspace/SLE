import { Config } from "../Config.js";
import { Environment } from "../Environment.js";
import { ModuleBase } from "./ModuleBase.js";

/**
 * Returns the combined infos of all given modules
 * @param env the environment
 * @param mods the modules
 * @returns some informations like the estimated runtime in millis
 */
export function getFullRuntime(env: Environment, mods: [ModuleBase, Config][]) : number{
    // Calculates the runtime of all modules
    return mods.map(([mod, cfg])=> mod.calculateRuntime(env, cfg)).reduce((a,b)=>a+b,0);
}