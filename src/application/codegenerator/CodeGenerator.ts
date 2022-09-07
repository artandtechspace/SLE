import { ModBlockExport } from "../ConfigBuilder.js";
import { C, printIf } from "../utils/WorkUtils.js";
import { VariableSystem } from "./variablesystem/VariableSystem.js";
import { FunctionSupplier } from "./variablesystem/CppFuncSupplier.js";
import { FunctionGenerator } from "./variablesystem/CppFuncGenerator.js";
import { UniqueNameSupplier } from "./variablesystem/UniqueNameSupplier.js";
import { getEnvironment } from "../SharedObjects.js";

// Regexes to match env-variables and code-insert-points
const CODE_REGEX = /\$\w+\$/gi;

// Returned from any module's code-generator
export interface ModuleCode {
    // Code to run once at startup
    // If not returned, unused
    setup?: string

    // Code to run over and over again
    // If not returned, unused
    loop?: string,

    // Is the led-strip dirty after that code is run (Meaning do leds have to be updated)
    // If not returned is false
    isDirty?: boolean
}

/**
 * Takes in the whole config and an array with modules and their configs. Then generates the cpp-code from it
 * @param variablesystem the used variable-system
 * @param mods all mods with their configs
 * @param beginDirtyState if the isDirty-state is dirty from the beginning
 * 
 * @returns the module-return for all modules. Meaning all setups and loop codes combined.
 */
export function generateModuleCode(variablesystem: VariableSystem, mods: ModBlockExport<any>[], funcSup: FunctionSupplier, beginDirtyState: boolean = false) : ModuleCode{
    
    // Final code storage
    var setupCode = "";
    var loopCode = "";

    // If the last module returned a dirty-state
    var isDirty: boolean = beginDirtyState;

    // Generates the code for the modules and appends it to the setup and loop strings
    function onGenCode(element: ModBlockExport<any>){
        // Generates the code
        var code: ModuleCode = element.module.generateCode(variablesystem,element.config, funcSup, isDirty);

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
 * @param setupMods all setup-modules specified with their settings.
 * @param loopMods all loop-modules specified with their settings.
 * @throws {Error} if an error occurred
 * 
 * @returns the generated code
 */
export function generateCode(setupMods: ModBlockExport<any>[], loopMods: ModBlockExport<any>[]) : string {

    // Creates the supplier for unique names
    var unqSup = new UniqueNameSupplier();

    // Creates the function generator
    var funcGen = new FunctionGenerator();

    // Registers all functions
    setupMods.forEach(mod=>mod.module.registerFunction(mod.config,funcGen));
    loopMods.forEach(mod=>mod.module.registerFunction(mod.config,funcGen));

    // Gets the current env
    var env = getEnvironment();

    // Creates the var-system
    var varSys = new VariableSystem(unqSup);

    // Will hold all codes (Loop, Setup and function-definitions)
    // TODO: Maybe add language lookup
    var definitionCode = C("Start of definition-code");
    var setupCode = C("Start of setup-code");
    var loopCode = C("Start of loop-code");

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
            case "FUNC_DEFS":
                return definitionCode;
            default:
                return match;
        }
    }

    // Converts the function-generator to it's supplier counterpart
    var funcSup = funcGen.toSupplier(varSys, unqSup);

    // Generates the function definitions
    definitionCode += funcSup.generateCppFuncDefinitions(varSys);

    // Gets the generated setup- and loop-codes (The execution may end here do to an error beeing thrown)
    var genSetupCode: ModuleCode = generateModuleCode(varSys,setupMods, funcSup);
    var genLoopCode: ModuleCode = generateModuleCode(varSys,loopMods, funcSup);

    // Appends the setup-codes
    if(genSetupCode.setup)
        setupCode += genSetupCode.setup;

    if(genLoopCode.setup)
        setupCode += genLoopCode.setup;

    // Appends the loop-codes
    if(genSetupCode.loop)
        setupCode += genSetupCode.loop;

    if(genLoopCode.loop)
        loopCode += genLoopCode.loop;
    
    // Checks if the generated code is still dirty and if so appends a push-operation
    loopCode+=printIf("\nFastLED.show();",genLoopCode.isDirty as boolean);
    setupCode+=printIf("\nFastLED.show();",genSetupCode.isDirty as boolean);

    // Generates the final code
    return env.preprocessingCode.replace(CODE_REGEX,replaceCodes)+"\n";
}