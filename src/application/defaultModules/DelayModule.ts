import { Environment } from "../Environment.js";
import { Arduino } from "../simulation/Arduino.js";
import { PositiveNumber } from "../types/Types.js";
import { printIf as pIf } from "../utils/WorkUtils.js";
import { VariableSystem } from "../codegenerator/variablesystem/VariableSystem.js";
import { ModuleBase } from "../modules/ModuleBase.js";
import { ModuleCode } from "../codegenerator/CodeGenerator.js";
import { FunctionSupplier } from "../codegenerator/variablesystem/CppFuncSupplier.js";

export type DelayModuleConfig = {
    delay: PositiveNumber
}

class DelayModule_ extends ModuleBase<DelayModuleConfig> {

    public calculateRuntime(env: Environment, config: DelayModuleConfig) : number {
        return config.delay;
    }

    public generateCode(env: Environment, varSys: VariableSystem, config: DelayModuleConfig, funcSup: FunctionSupplier, isDirty: boolean): ModuleCode {
         // Ensures that there is actually a delay set
        if(config.delay === 0)
            return {};
        
        // Generates a push-operation if there the stripe is dirty
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