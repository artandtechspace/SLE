import { Config } from "../Config";
import { Environment } from "../Environment";
import { VariableSystem } from "../variablesystem/VariableSystem";
import { ModuleBase } from "../modules/ModuleBase";
import { ModuleReturn } from "../modules/ModuleReturn";

class TestModule extends ModuleBase{

    public generateCode(env : Environment, varSys : VariableSystem, config: Config) : string|ModuleReturn{
        
        return {
        }
    }
}

export default new TestModule();