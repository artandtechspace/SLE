import { Config } from "../Config";
import { Environment } from "../Environment";
import { VariableSystem } from "../variablesystem/VariableSystem";
import { C } from "../utils/WorkUtils";
import { ModuleReturn } from "../modules/ModuleReturn";
import { ModuleBase } from "../modules/ModuleBase";

/**
 * This is a special module which can't be directly instanciated by a json-config.
 * To delay something, just write the integer in millis inside the array
 */

class CommentModule extends ModuleBase {

    public generateCode(env: Environment, _: VariableSystem, config: Config): string | ModuleReturn {
        return {
            loop: `delay(${config.getRaw("delay")});\n`
        };
    }
}

export default new CommentModule();