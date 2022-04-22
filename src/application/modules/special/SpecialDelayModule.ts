import { Config } from "../../Config.js";
import { Environment } from "../../Environment.js";
import { VariableSystem } from "../../variablesystem/VariableSystem.js";
import { ModuleBase } from "../ModuleBase.js";
import { ModuleReturn } from "../ModuleReturn.js";

/**
 * This is a special module which can't be directly instanciated by a json-config.
 * To delay something, just write the integer in millis inside the array
 */

class SpecialCommentModule extends ModuleBase {

    public generateCode(env: Environment, _: VariableSystem, config: Config): string | ModuleReturn {
        return {
            loop: `delay(${config.getRaw("delay")});\n`
        };
    }
}

export default new SpecialCommentModule();