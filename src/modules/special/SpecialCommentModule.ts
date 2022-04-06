import { Config } from "../../Config";
import { Environment } from "../../Environment";
import { C } from "../../utils/WorkUtils";
import { VariableSystem } from "../../variablesystem/VariableSystem";
import { ModuleBase } from "../ModuleBase";
import { ModuleReturn } from "../ModuleReturn";

/**
 * This is a special module which can't be directly instanciated by a json-config.
 * To comment something, just write a string inside the modules
 */

class SpecialCommentModule extends ModuleBase {

    public generateCode(env: Environment, _: VariableSystem, config: Config): string | ModuleReturn {
        return {
            loop: C(config.getRaw("comment"),env)
        };
    }
}

export default new SpecialCommentModule();