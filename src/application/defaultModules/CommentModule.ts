import { ModuleCode } from "../codegenerator/CodeGenerator.js";
import { Environment } from "../Environment.js";
import { ModuleBase } from "../modules/ModuleBase.js";
import { FunctionSupplier } from "../codegenerator/variablesystem/CppFuncSupplier.js";
import { VariableSystem } from "../codegenerator/variablesystem/VariableSystem.js";
import { getEnvironment } from "../SharedObjects.js";


export type CommentModuleConfig = {
    text: string
}

class CommentModule_ extends ModuleBase<CommentModuleConfig> {

    public generateCode(varSys: VariableSystem, config: CommentModuleConfig, funcSup: FunctionSupplier, isDirty: boolean): ModuleCode {
        // Ensures that comments are active
        if(getEnvironment().withComments)
            return {
                loop: "// "+config.text
            };
        
        return {};
    }
}

export const CommentModule = new CommentModule_();