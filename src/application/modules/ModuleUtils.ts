import { Environment } from "../Environment.js";
import { ModBlockExport } from "../ConfigBuilder.js";
import { OpenObject, PositiveNumber } from "../types/Types.js";
import { ModuleBase } from "./ModuleBase.js";

/**
 * Returns the combined infos of all given modules
 * @param env the environment
 * @param mods the modules
 * @returns some informations like the estimated runtime in millis
 */
export function getFullRuntime(env: Environment, mods: ModBlockExport<any>[]) : number{
    // Calculates the runtime of all modules
    return mods.map(exp=> exp.module.calculateRuntime(env, exp.config)).reduce((a,b)=>a+b,0);
}

/**
 * Return all mod-exports that are accessing an led which is out of bounds
 * @param env the environment
 * @param mods the mod-exports
 */
export function getOutOfBoundsModExports(env: Environment, mods: ModBlockExport<any>[]) {
    return mods.map(exp=>{
        // Calculates the led-index (if given)
        var ledIndex = exp.module.calculateMaxAccessedLed(env,exp.config);

        // Ensures that the module has an index
        if(ledIndex === undefined)
            return;

        return { ...exp, ledIndex }
    }).filter(obj=> obj !== undefined && env.ledAmount <= obj.ledIndex) as any as
    // Even tho this is not the most beautiful code, it is required here
    {
        module: ModuleBase<any>,
        config: OpenObject,
        block: any,
        ledIndex: PositiveNumber
    }[];
}