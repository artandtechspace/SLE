import { Config } from "../../Config";
import { Environment } from "../../Environment";
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
            loop: "// "+config.getRaw("comment")
        };
    }
}

export default new SpecialCommentModule();