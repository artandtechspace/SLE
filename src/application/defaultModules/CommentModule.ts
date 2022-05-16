import { ModuleCode } from "../codegenerator/CodeGenerator.js";
import { Environment } from "../Environment.js";
import { ModuleBase } from "../modules/ModuleBase.js";
import { PositiveNumber } from "../types/Types.js";
import { FunctionSupplier } from "../variablesystem/CppFuncSupplier.js";
import { VariableSystem } from "../variablesystem/VariableSystem.js";


/**
 * This is a special module which can't be directly instanciated by a json-config.
 * To comment something, just write a string inside the modules
 */


export type CommentModuleConfig = {
    text: string
}

class CommentModule_ extends ModuleBase<CommentModuleConfig> {

    public generateCode(env: Environment, varSys: VariableSystem, config: CommentModuleConfig, funcSup: FunctionSupplier, isDirty: boolean): ModuleCode {
        // Ensures that comments are active
        if(env.withComments)
            return {
                loop: "// "+config.text
            };
        
        return {};
    }
}

export const CommentModule = new CommentModule_();