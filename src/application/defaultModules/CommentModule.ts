import { ModuleCode } from "../codegenerator/CodeGenerator.js";
import { Environment } from "../Environment.js";
import { ModuleBase } from "../modules/ModuleBase.js";
import { FunctionSupplier } from "../codegenerator/variablesystem/CppFuncSupplier.js";
import { VariableSystem } from "../codegenerator/variablesystem/VariableSystem.js";


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