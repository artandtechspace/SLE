import { Config } from "../Config.js";
import { Environment } from "../Environment.js";
import { VariableSystem } from "../variablesystem/VariableSystem.js";
import { ModuleBase } from "../modules/ModuleBase.js";
import { ModuleReturn } from "../modules/ModuleReturn.js";
import { isInteger, printIf as pif } from "../utils/WorkUtils.js";
import { tryParseModules } from "../codegenerator/ConfigValidator.js";
import { generateModuleCode } from "../codegenerator/CodeGenerator.js";

class LoopModule extends ModuleBase {
    
    public generateCode(env: Environment, varSys: VariableSystem, config: Config): string | ModuleReturn {

        // Gets the submodules
        var rawSubmodules = config.getRaw("modules");

        // Gets further settings
        var repeats = config.getRequired("repeats",v=>isInteger(v,2),"must be an integer >= 2");
        var delayBetween = config.getOptional("delay",v=>isInteger(v,1),"must be an integer >= 1",undefined);


        // Validates the submodules
        var submodules = tryParseModules(rawSubmodules);

        // Checks if the submodules failed to parse
        if(typeof submodules === "string")
            throw "Failed to pass submodules: "+submodules;

        // Gets the generated codes (The execution may end here do to an error beeing thrown)
        var generatedCode:ModuleReturn = generateModuleCode(env,varSys,submodules);

        // Requests the local variable
        var vItr = varSys.requestLocalVariable("int","i","0");


        // Generates the new loop code
        var loopCode = `
            for(${vItr.declair()} ${vItr} < ${repeats}; ${vItr}++){
                ${generatedCode.loop ?? ""} ${pif(`\ndelay(${delayBetween});`, delayBetween !== undefined)}
            }
        `;

        return {
            setup: generatedCode.setup,
            loop: loopCode
        };
    }
}

export default new LoopModule();