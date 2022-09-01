import { VariableSystem } from "../codegenerator/variablesystem/VariableSystem.js";
import { ModuleBase } from "../modules/ModuleBase.js";
import { printIfElse } from "../utils/WorkUtils.js";
import { Min, OpenObject, PositiveNumber as PositiveNumber, RGBNumber } from "../types/Types.js";
import { FunctionGenerator } from "../codegenerator/variablesystem/CppFuncGenerator.js";
import { ModuleCode } from "../codegenerator/CodeGenerator.js";
import { FunctionSupplier } from "../codegenerator/variablesystem/CppFuncSupplier.js";
import { CppBool, CppByte, CppInt, CppVoid } from "../codegenerator/variablesystem/CppTypes.js";
import { CppFuncParam, CppFuncParams, CppTypeDefintion } from "../codegenerator/variablesystem/CppFuncDefs.js";
import { printEquation } from "../utils/EquationUtils.js";
import { Variable } from "../codegenerator/variablesystem/Variable.js";
import { Arduino } from "../simulation/Arduino.js";
import { getHexFromRGB } from "../utils/ColorUtils.js";

export type ColorModuleConfig = {
    // Amount of leds per step
    ledsPerStep: Min<1>,

    // Where to start from on the step
    start: PositiveNumber,

    // Space between steps
    space: PositiveNumber,

    // Amount of steps
    steps: Min<1>,

    // Delay that will be waited per led
    delayPerLed: PositiveNumber,

    // Delay that will be waited between steps
    delayAfterStep: PositiveNumber,
    
    // Color
    clr_r: RGBNumber,
    clr_g: RGBNumber,
    clr_b: RGBNumber,

    
    modus: StepMode,

    reversed: boolean
};

export enum StepMode{
    PARALLEL,
    SERIES
}

// Returns the name of the mode-function (Returns undefined if an invalid depth is given)
function getModeName(depth: ModDepth, mode: StepMode, reversed: boolean) : string|undefined{

    switch(depth){
        case ModDepth.FULL_STEPS:
            return `ColorSteps${mode === StepMode.PARALLEL ? "Parallel" : "Series"}${reversed ? "Reversed" : ""}`;

        case ModDepth.LED_LINE:
            return `ColorLine${reversed ? "Reversed" : ""}`;
    }

    return undefined;
}

// Which depth the color-module has to use
enum ModDepth{
    // Only a single led has to be lit
    SINGLE_LED,
    // A line of led has to be lit
    LED_LINE,
    // Multiple lines with spaces between have to be lit
    FULL_STEPS
}

class ColorModule_ extends ModuleBase<ColorModuleConfig>{

    // Default configuration
    public readonly DEFAULT_CONFIG: ColorModuleConfig = {
        delayAfterStep: 0 as PositiveNumber,
        delayPerLed: 0 as PositiveNumber,
        ledsPerStep: 1 as Min<1>,
        space: 0 as PositiveNumber,
        start: 0 as PositiveNumber,
        steps: 1 as Min<1>,

        clr_r: 255 as RGBNumber,
        clr_g: 0 as RGBNumber,
        clr_b: 0 as RGBNumber,

        modus: StepMode.SERIES,

        reversed: false
    };

    //#region Code-Generation

     // Takes in a delay-parameter from the cpp-parameters and returns the code depending on the value of the parameter
     private generateDelayCode(delayParam: CppFuncParam<number>){
        var delayCode = "\nFastLED.show();\ndelay("+delayParam.value+");";
        return printIfElse(
            delayParam.value > 0 ? delayCode : ``,
            `
                if(${delayParam.value} > 0){
                    ${delayCode}
                }
            `,
            delayParam.isStatic
        );
    }

    // Converts the rgb-color to an crgb-string
    private getRGBCode(prms: CppFuncParams<ColorModuleConfig>){
        return `CRGB(${prms.clr_r.value},${prms.clr_g.value},${prms.clr_b.value})`;
    }




    /**
     * Function that is used to generate the start value for an led or step-loop
     * 
     * This takes the reversed state and based on that returnes eigther 0 if not reversed or the ending value minus one.
     * Even directly calculated if the parameter is static
     */
    private getLoopStartFromParameter(reversed: boolean, prm: CppFuncParam<number>){
        if(reversed)
            return prm.isStatic ? ((prm.value as number)-1).toString() : `${prm.value}-1`;
        return '0';
    }


    // Generates the code for a single line depth
    private generateLine(varSys: VariableSystem, prms: CppFuncParams<ColorModuleConfig>, reversed: boolean) : string{

        // Led-loop conditions (Start value and loop condition eg. > or < than 0 or something else)
        const ledLoopCondition = reversed ? "<= 0" : `> ${prms.ledsPerStep.value.toString()}`;

        // Loop-updation (The thing at the end of the loop eg. i++)
        const loopUpdation = reversed ? "--" : "++";

        // Requests the led variable
        var vLed = varSys.requestLocalVariable("int", "led", this.getLoopStartFromParameter(reversed, prms.ledsPerStep));
        
        // Generates the for-loop
        var forLoopLed = `for(${vLed.declair()} ${vLed} ${ledLoopCondition}; ${vLed}${loopUpdation}) {`;



        // Gets the led-index-calculation
        // cfg.start + led
        var idxCalc = printEquation(
            "$start + $led",
            this.getEquationsConfig(prms,vLed)
        );
        
        // Gets the color
        var clr = this.getRGBCode(prms);

        

        return `
            ${forLoopLed}
                leds[${idxCalc}] = ${clr};${this.generateDelayCode(prms.delayPerLed)}
            }
        `;
    }

    // Generates the code for multiple steps depth
    private generateFullSteps(varSys: VariableSystem, prms: CppFuncParams<ColorModuleConfig>, mode: StepMode, reversed: boolean) : string{

        // Led-loop condition
        const ledLoopCondition = reversed ? "<= 0" : `> ${prms.ledsPerStep.value.toString()}`;

        // Step-loop condition
        const stepLoopCondition = reversed ? "<= 0" : `> ${prms.steps.value.toString()}`;

        // Loop-updation (The thing at the end of the loop eg. i++)
        const loopUpdation = reversed ? "--" : "++";
        
        // Gets the variables
        var vStep = varSys.requestLocalVariable("int", "steps", this.getLoopStartFromParameter(reversed, prms.steps));
        var vLed = varSys.requestLocalVariable("int", "led", this.getLoopStartFromParameter(reversed, prms.ledsPerStep));

        // Gets the led-index-calculation
        // cfg.start+step * (cfg.space+cfg.ledsPerStep) + led
        var idxCalc = printEquation(
            "$start + $step * ($space + $ledsPerStep) + $led",
            this.getEquationsConfig(prms,vLed,vStep)
        );
        
        // Gets the color
        var clr = this.getRGBCode(prms);

        // Generates the for-loops
        var forLoopStep = `for(${vStep.declair()} ${vStep} ${stepLoopCondition}; ${vStep}${loopUpdation}) {`;
        var forLoopLed = `for(${vLed.declair()} ${vLed} ${ledLoopCondition}; ${vLed}${loopUpdation}) {`;

        // Generates the code-fragments
        var ledSet = `leds[${idxCalc}] = ${clr};`;
        var delPerLed = `${this.generateDelayCode(prms.delayPerLed)}`;
        var delPerStep = `${this.generateDelayCode(prms.delayAfterStep)}`;

        // Assembles the code based on the mode
        if(mode === StepMode.SERIES){
            return `
            ${forLoopStep}
                ${forLoopLed}
                    ${ledSet}${delPerLed}
                }
                ${delPerStep}
            }
            `;
        }else{
            return `
            ${forLoopStep}
                ${forLoopLed}
                    ${ledSet}${delPerStep}
                }
                ${delPerLed}
            }
            `;
        }
    }






    public registerFunction(config: ColorModuleConfig, funcGen: FunctionGenerator): void {
        // Gets the depth
        var depth = this.getConfigDepth(config);

        // Tries to get the name for the config, thereby also checking if the config must have an function
        var name = getModeName(depth, config.modus, config.reversed);

        if(name === undefined)
            return;

        // Generates the code-generator-callback function
        var callback = depth === ModDepth.FULL_STEPS ?
            (varSys: VariableSystem, params: CppFuncParams<ColorModuleConfig>) => this.generateFullSteps(varSys,params, config.modus, config.reversed) :
            (varSys: VariableSystem, params: CppFuncParams<ColorModuleConfig>) => this.generateLine(varSys, params, config.reversed);

        // Registers the function
        funcGen.registerCppFunc(this, name, CppVoid, this.getCppTypeDefinition(), config, callback);
    }

    public generateCode(varSys: VariableSystem, cfg: ColorModuleConfig, funcSup: FunctionSupplier, isDirty: boolean): ModuleCode {
        // Gets the depth
        var depth = this.getConfigDepth(cfg);

        switch(depth){
            case ModDepth.SINGLE_LED:
                return {
                    loop: `leds[${cfg.start}] = CRGB(${cfg.clr_r},${cfg.clr_g},${cfg.clr_b});`,
                    isDirty: true
                }
            case ModDepth.LED_LINE: case ModDepth.FULL_STEPS:
                return {
                    loop: funcSup.getCppFuncCall(this,getModeName(depth, cfg.modus, cfg.reversed) as string,cfg),
                    isDirty: (
                        depth === ModDepth.LED_LINE ?
                        // Led-line-depth calculation
                        (cfg.delayPerLed <= 0) :
                        // Full-steps-depth calculation
                        (cfg.delayPerLed <= 0 && cfg.delayAfterStep <= 0)
                    )
                };
        }
    }

    //#endregion

    //#region Simulation


    // Function to simulate a single led
    private async simulateSingleLed(cfg: ColorModuleConfig, ssot: OpenObject, arduino: Arduino) : Promise<void>{
        arduino.setLedHex(cfg.start, ssot.clr);
    }

    // Function to simulate an array (stripe) of leds
    private async simulateLedStripe(cfg: ColorModuleConfig, ssot: OpenObject, arduino: Arduino) : Promise<void>{
        for(var led = 0; led < cfg.ledsPerStep; led++){
            const idx = led

             // Updates the color
             arduino.setLedHex(cfg.reversed ? (ssot.lastLed-idx) : (idx + cfg.start), ssot.clr);
                
             // Inserts a delay if required and pushes the update
             if(cfg.delayPerLed > 0){
                 arduino.pushLeds();
                 await arduino.delay(cfg.delayPerLed);
             }
        }
    }

    // Function to simulate a full stripe with mode in series
    private async simulateFullStripeInSeries(cfg: ColorModuleConfig, ssot: OpenObject, arduino: Arduino) : Promise<void> {
        for(var step = 0; step < cfg.steps; step++){
            // For every led of that step
            for(var led = 0; led < cfg.ledsPerStep; led++){

                const idx = step * (cfg.space+cfg.ledsPerStep) + led;

                // Updates the color
                arduino.setLedHex(cfg.reversed ? (ssot.lastLed-idx) : (idx + cfg.start), ssot.clr);
                
                // Inserts a delay if required and pushes the update
                if(cfg.delayPerLed > 0){
                    arduino.pushLeds();
                    await arduino.delay(cfg.delayPerLed);
                }
            }

            // Inserts a delay if required and pushes the update
            if(cfg.delayAfterStep > 0){
                arduino.pushLeds();
                await arduino.delay(cfg.delayAfterStep);
            }
        }
    }

    // Function to simulate a full stripe with mode in parallel
    private async simulateFullStripeParallel(cfg: ColorModuleConfig, ssot: OpenObject, arduino: Arduino) : Promise<void> {
        // For every led of that step
        for(var led = 0; led < cfg.ledsPerStep; led++){

            // Updates the color
            for(var step = 0; step < cfg.steps; step++){
                const idx = step * (cfg.space+cfg.ledsPerStep) + led;

                arduino.setLedHex(cfg.reversed ? (ssot.lastLed-idx) : (idx + cfg.start), ssot.clr);

                if(cfg.delayAfterStep > 0){
                    arduino.pushLeds()
                    await arduino.delay(cfg.delayAfterStep);
                }
            }
            
            // Inserts a delay if required and pushes the update
            if(cfg.delayPerLed > 0){
                arduino.pushLeds();
                await arduino.delay(cfg.delayPerLed);
            }
        }
    }





    public simulateSetup(cfg: ColorModuleConfig, ssot: OpenObject, arduino: Arduino): void {
        ssot.clr = getHexFromRGB(cfg.clr_r,cfg.clr_g,cfg.clr_b);
        ssot.lastLed = this.calculateMaxAccessedLed(cfg);
        
        // Gets the depth
        var depth = this.getConfigDepth(cfg);

        // Gets the function to execute the simulation
        switch(depth){
            case ModDepth.SINGLE_LED: default:
                ssot.executor = this.simulateSingleLed;
                break;
            case ModDepth.LED_LINE:
                ssot.executor = this.simulateLedStripe;
                break;
            case ModDepth.FULL_STEPS:
                ssot.executor = cfg.modus === StepMode.PARALLEL ? this.simulateFullStripeParallel : this.simulateFullStripeInSeries;
                break;
        }
    }

    public async simulateLoop(cfg: ColorModuleConfig, ssot: OpenObject, arduino: Arduino): Promise<void> {
        // Executes the simulation-function
        await ssot.executor(cfg,ssot,arduino);

        // Updates the leds
        arduino.pushLeds(); 
    }


    //#endregion

    // Takes in a config and returns it's depth
    private getConfigDepth(cfg: ColorModuleConfig) : ModDepth{
        // Checks if there is only a single step
        if (cfg.steps === 1)
            // Return if there is only a single led or multiple leds
            return cfg.ledsPerStep <= 1 ? ModDepth.SINGLE_LED : ModDepth.LED_LINE;

        return ModDepth.FULL_STEPS;
    }

    // Returns the mapped values for equations
    private getEquationsConfig(prms: CppFuncParams<ColorModuleConfig>, led: Variable, step?: Variable){
        return {
            "start": prms.start.value,
            "space": prms.space.value,
            "ledsPerStep": prms.ledsPerStep.value,
            "led": led,
            "step": step ?? 0
        };
    }

    // Returns the type-definitions for the module-config
    private getCppTypeDefinition() : CppTypeDefintion<ColorModuleConfig>{
        return {
            delayAfterStep: CppInt,
            delayPerLed: CppInt,
            ledsPerStep: CppInt,
            space: CppInt,
            start: CppInt,
            steps: CppInt,
            clr_r: CppByte,
            clr_g: CppByte,
            clr_b: CppByte,
            modus: CppBool,
            reversed: CppBool
        }
    }

   



    




    public calculateRuntime(cfg: ColorModuleConfig) : number {
        // Checks if only a single led is given
        if(cfg.ledsPerStep === 1 && cfg.steps === 1)
            return 0;

        return (cfg.delayPerLed * cfg.ledsPerStep + cfg.delayAfterStep) * cfg.steps
    }

    public calculateMaxAccessedLed(cfg: ColorModuleConfig): PositiveNumber|void {
        return cfg.start+cfg.steps*cfg.ledsPerStep+(cfg.steps-1)*cfg.space-1 as PositiveNumber;
    }
}

export const ColorModule = new ColorModule_();