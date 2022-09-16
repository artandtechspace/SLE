import { Arduino } from "../simulation/Arduino";
import { PositiveNumber } from "../types/Types";
import { printIf as pIf } from "../utils/WorkUtils";
import { VariableSystem } from "../codegenerator/variablesystem/VariableSystem";
import { ModuleBase } from "../modules/ModuleBase";
import { ModuleCode } from "../codegenerator/CodeGenerator";
import { FunctionSupplier } from "../codegenerator/variablesystem/CppFuncSupplier";

export type DelayModuleConfig = {
    delay: PositiveNumber
}

class DelayModule_ extends ModuleBase<DelayModuleConfig> {

    public calculateRuntime(config: DelayModuleConfig) : number {
        return config.delay;
    }

    public generateCode(varSys: VariableSystem, config: DelayModuleConfig, funcSup: FunctionSupplier, isDirty: boolean): ModuleCode {
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

    public async simulateLoop(config: DelayModuleConfig, singleSourceOfTruth: {[k: string]: any}, arduino: Arduino){
        await arduino.delay(config.delay);
    }
}

export const DelayModule = new DelayModule_();