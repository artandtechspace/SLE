import { Config } from "../../Config.js";
import { Environment } from "../../Environment.js";
import { VariableSystem } from "../../variablesystem/VariableSystem.js";
import { ModuleBase } from "../ModuleBase.js";
import { ModuleReturn } from "../ModuleReturn.js";

/**
 * This is a special module which can't be directly instanciated by a json-config.
 * To comment something, just write a string inside the modules
 */

class SpecialCommentModule extends ModuleBase {

    public generateCode(env: Environment, _: VariableSystem, config: Config): ModuleReturn {
        return {
            loop: "// "+config.getRaw("comment")
        };
    }
}

export default new SpecialCommentModule();