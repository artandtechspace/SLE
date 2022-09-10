import { ModBlockExport } from "../ConfigBuilder.js";
import { OpenObject, PositiveNumber } from "../types/Types.js";
import { ModuleBase } from "./ModuleBase.js";
import { getEnvironment } from "../SharedObjects.js";

/**
 * Returns the estimated runtime of the given configuration
 * @param mods the modules
 */
export function getFullRuntime(mods: ModBlockExport<any>[]) : number{
    // Calculates the runtime of all modules
    return mods.map(exp=> exp.module.calculateRuntime(exp.config)).reduce((a,b)=>a+b,0);
}

/**
 * Return all mod-exports that are accessing an led which is out of bounds
 * @param mods the mod-exports
 */
export function getOutOfBoundsModExports(mods: ModBlockExport<any>[]) {
    // Gets current env
    var env = getEnvironment();

    return mods.map(exp=>{
        // Calculates the led-index (if given)
        var ledIndex = exp.module.calculateMaxAccessedLed(exp.config);

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