import { Config } from "../Config";
import { Environment } from "../Environment";
import { ModuleBase } from "../modules/ModuleBase";
import { ModuleReturn } from "../modules/ModuleReturn";
import { C } from "../utils/WorkUtils";
import { VariableSystem } from "../variablesystem/VariableSystem";

// Regexes to match env-variables and code-insert-points
const CODE_REGEX = /\$\w+\$/gi;

/**
 * Takes in all configurations and generates the code from them.
 * 
 * @param env environment passed by the user to the config.
 * @param elements all modules specified with their settings.
 * @returns a single string (or throws an error) that contains the finalized code.
 */
export function generateCode(env: Environment, elements: [ModuleBase, Config][]) : string{

    // Creates the var-system
    var varSys = new VariableSystem(env);

    var setupCode = C("Start of setup-code",env);
    var loopCode = C("Start of loop-code",env);

    // Generates the code for the modules and appends it to the setup and loop strings
    function onGenCode(element: [ModuleBase,Config]){
        // Generates the code
        var code: ModuleReturn = element[0].generateCode(env,varSys,element[1]);

        // Checks if loop-code got added
        if(code.loop !== undefined)
            loopCode+=`${code.loop}\n\n`;

        // Checks if loop-code got added
        if(code.setup !== undefined)
            setupCode+=`${code.setup}\n\n`;
    }

    // Replace-function to insert code and env-variables into the environment
    function replaceCodes(match: string) : string{
        // Gets the real name
        var name = match.substring(1,match.length-1);

        // Returns the correct element to insert at that place
        switch(name){
            case "LED_PIN":
                return env.ledPin.toString();
            case "LED_AMOUNT":
                return env.ledAmount.toString();
            case "VARIABLES":
                return varSys.generateGlobalCode();
            case "SETUP_CODE":
                return setupCode;
            case "RUN_CODE":
                return loopCode;
            default:
                return match;
        }
    }

    // Current element
    var i = 0;
    try{
        // Generates the codes
        for(;i<elements.length; i++)
            onGenCode(elements[i]);
    }catch(e){
        // Some element had an error
        throw "Error while processing Module: "+elements[i][0].constructor.name+":\n"+e;
    }

    // Generates the final code
    return env.preprocessingCode.replace(CODE_REGEX,replaceCodes);
}