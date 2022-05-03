import { Environment } from "../Environment.js";
import { ModBlockExport } from "../ConfigBuilder.js";

/**
 * Returns the combined infos of all given modules
 * @param env the environment
 * @param mods the modules
 * @returns some informations like the estimated runtime in millis
 */
export function getFullRuntime(env: Environment, mods: ModBlockExport<any>[]) : number{
    // Calculates the runtime of all modules
    return mods.map((exp)=> exp.module.calculateRuntime(env, exp.config)).reduce((a,b)=>a+b,0);
}