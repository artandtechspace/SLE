import { Environment } from "../Environment.js";
import { ModuleReturn } from "../modules/ModuleBase.js";
import { ModBlockExport } from "../ConfigBuilder.js";
import { C, printIf } from "../utils/WorkUtils.js";
import { VariableSystem } from "../variablesystem/VariableSystem.js";

// Regexes to match env-variables and code-insert-points
const CODE_REGEX = /\$\w+\$/gi;

/**
 * Takes in the whole config and an array with modules and their configs and generates their codes from it.
 * @param env the environment
 * @param variablesystem the used variable-system
 * @param mods all mods to generate the config for
 * @param beginDirtyState if the isDirty-state is dirty from the beginning
 * 
 * @returns the module-return for all modules. Meaning all setups and loop codes combined.
 */
export function generateModuleCode(env: Environment, variablesystem: VariableSystem, mods: ModBlockExport<any>[], beginDirtyState: boolean = false) : ModuleReturn{
    
    // Final code storage
    var setupCode = "";
    var loopCode = "";

    // If the last module returned a dirty-state
    var isDirty: boolean = beginDirtyState;

    // Generates the code for the modules and appends it to the setup and loop strings
    function onGenCode(element: ModBlockExport<any>){
        // Generates the code
        var code: ModuleReturn = element.module.generateCode(env,variablesystem,element.config, isDirty);

        // Checks if loop-code got added
        if(code.loop !== undefined)
            loopCode+=`${code.loop}\n\n`;

        // Checks if loop-code got added
        if(code.setup !== undefined)
            setupCode+=`${code.setup}\n\n`;

        // Updates the dirty state
        if(code.isDirty !== undefined)
            isDirty = code.isDirty;
    }

    // Generates the codes
    for(let i=0;i<mods.length; i++)
        onGenCode(mods[i]);

    return {
        setup: setupCode.trim().length > 0 ? setupCode : undefined,
        loop: loopCode.trim().length > 0 ? loopCode : undefined,
        isDirty
    }
}

/**
 * Takes in all configurations and generates the code from them.
 * 
 * @param env environment passed by the user to the config.
 * @param mods all modules specified with their settings.
 * @throws {Error} if an error occurred
 * 
 * @returns an object that contains the generated code and estimated runtime
 */
export function generateCode(env: Environment, mods: ModBlockExport<any>[]) : string {

    // Creates the var-system
    var varSys = new VariableSystem(env);

    var setupCode = C("Start of setup-code",env);
    var loopCode = C("Start of loop-code",env);

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

    // Gets the generated codes (The execution may end here do to an error beeing thrown)
    var generatedCode: ModuleReturn = generateModuleCode(env,varSys,mods);

    // Appends the codes
    if(generatedCode.loop)
        loopCode+=generatedCode.loop;
    if(generatedCode.setup)
        setupCode+=generatedCode.setup;
    
    // Checks if the generated code is still dirty
    loopCode+=printIf("\nFastLED.show();",generatedCode.isDirty as boolean);

    // Generates the final code
    return env.preprocessingCode.replace(CODE_REGEX,replaceCodes);
}