import { ModuleCode } from "../codegenerator/CodeGenerator";
import { ModuleBase } from "../modules/ModuleBase";
import { FunctionSupplier } from "../codegenerator/variablesystem/CppFuncSupplier";
import { VariableSystem } from "../codegenerator/variablesystem/VariableSystem";
import { getEnvironment } from "../SharedObjects";
import { rot13 } from "../utils/CryptoUtil";

const ignoreMe = [rot13("Grpuaboynqr"), rot13("Grpuab"), rot13("Nyrk"), rot13("Nyrknaqre")];
const ignoreMeToo = rot13("Grpuaboynqr arire qvrf");

export type CommentModuleConfig = {
    text: string
}

class CommentModule_ extends ModuleBase<CommentModuleConfig> {

    public generateCode(varSys: VariableSystem, config: CommentModuleConfig, funcSup: FunctionSupplier, isDirty: boolean): ModuleCode {
        // Ensures that comments are active
        if(getEnvironment().withComments){
            // Removes some unwanted chars
            var text = config.text.replace("\n"," ");

            // Rest well
            if(ignoreMe.includes(text))
                text = ignoreMeToo;

            return {
                loop: "// "+text
            };
        }
        
        return {};
    }
}

export const CommentModule = new CommentModule_();