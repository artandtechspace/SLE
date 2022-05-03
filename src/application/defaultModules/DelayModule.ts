import { Environment } from "../Environment.js";
import { Arduino } from "../simulation/Arduino.js";
import { PositiveNumber } from "../types/Types.js";
import { printIf as pIf } from "../utils/WorkUtils.js";
import { VariableSystem } from "../variablesystem/VariableSystem.js";
import { ModuleBase } from "../modules/ModuleBase.js";
import { ModuleReturn } from "../modules/ModuleBase.js";

/**
 * This is a special module which can't be directly instanciated by a json-config.
 * To delay something, just write the integer in millis inside the array
 */

export type DelayModuleConfig = {
    delay: PositiveNumber
}

class DelayModule_ extends ModuleBase<DelayModuleConfig> {

    public calculateRuntime(env: Environment, config: DelayModuleConfig) : number {
        return config.delay;
    }

    public generateCode(env: Environment, _: VariableSystem, config: DelayModuleConfig, isDirty: boolean): ModuleReturn {
        
        // Ensures that there is actually a delay set
        if(config.delay === 0)
            return {};
        
        // Generates a push-operation for any idle leds of there are some
        var opPush = pIf("FastLED.show();\n", isDirty);

        return {
            loop: `${opPush}delay(${config.delay});\n`,
            isDirty: false
        };
    }

    public async simulateLoop(env : Environment, config: DelayModuleConfig, singleSourceOfTruth: {[k: string]: any}, arduino: Arduino){
        await arduino.delay(config.delay);
    }
}

export const DelayModule = new DelayModule_();