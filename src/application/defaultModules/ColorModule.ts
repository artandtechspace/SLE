import { Environment } from "../Environment.js";
import { VariableSystem } from "../variablesystem/VariableSystem.js";
import { ModuleBase } from "../modules/ModuleBase.js";
import { printIfElse } from "../utils/WorkUtils.js";
import { HexColor, Min, OpenObject, PositiveNumber as PositiveNumber, RGBNumber } from "../types/Types.js";
import { FunctionGenerator } from "../variablesystem/CppFuncGenerator.js";
import { ModuleCode } from "../codegenerator/CodeGenerator.js";
import { FunctionSupplier } from "../variablesystem/CppFuncSupplier.js";
import { CppByte, CppInt, CppVoid } from "../variablesystem/CppTypes.js";
import { CppFuncParam, CppFuncParams, CppTypeDefintion } from "../variablesystem/CppFuncDefs.js";
import { printEquation } from "../utils/EquationHandler.js";
import { Variable } from "../variablesystem/Variable.js";
import { Arduino } from "../simulation/Arduino.js";
import { getCppRGBStringFromHex, getHexFromRGB, RGB } from "../utils/ColorUtils.js";

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
};

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
        clr_b: 0 as RGBNumber
    };

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
            clr_b: CppByte
        }
    }

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

    private getRGBCode(prms: CppFuncParams<ColorModuleConfig>){
        return `CRGB(${prms.clr_r.value},${prms.clr_g.value},${prms.clr_b.value})`;
    }

    // Generates the code for a single line depth
    private generateLine(env: Environment, varSys: VariableSystem, prms: CppFuncParams<ColorModuleConfig>) : string{

        // Requests the led variable
        var vLed = varSys.requestLocalVariable("int", "led", "0");

        // Gets the led-index-calculation
        // cfg.start + led
        var idxCalc = printEquation(
            "$start + $led",
            this.getEquationsConfig(prms,vLed)
        );
        
        // Gets the color
        var clr = this.getRGBCode(prms);

        return `
            for(${vLed.declair()} ${vLed} < ${prms.ledsPerStep.value}; ${vLed}++){
                leds[${idxCalc}] = ${clr};${this.generateDelayCode(prms.delayPerLed)}
            }
        `;
    }

    // Generates the code for multiple steps depth
    private generateFullSteps(env: Environment, varSys: VariableSystem, prms: CppFuncParams<ColorModuleConfig>) : string{

        // Gets the variables
        var vStep = varSys.requestLocalVariable("int", "steps", "0");
        var vLed = varSys.requestLocalVariable("int", "led", "0");

        // Gets the led-index-calculation
        // cfg.start+step * (cfg.space+cfg.ledsPerStep) + led
        var idxCalc = printEquation(
            "$start + $step * ($space + $ledsPerStep) + $led",
            this.getEquationsConfig(prms,vLed,vStep)
        );
        
        // Gets the color
        var clr = this.getRGBCode(prms);

        return `
            for(${vStep.declair()} ${vStep} < ${prms.steps.value}; ${vStep}++){
                for(${vLed.declair()} ${vLed} < ${prms.ledsPerStep.value}; ${vLed}++){
                    leds[${idxCalc}] = ${clr};${this.generateDelayCode(prms.delayPerLed)}
                }${this.generateDelayCode(prms.delayAfterStep)}
            }
        
        `;
    }



    

    public registerFunction(env: Environment, config: ColorModuleConfig, funcGen: FunctionGenerator): void {
        // Gets the depth
        var depth = this.getConfigDepth(config);

        switch(depth){
            case ModDepth.FULL_STEPS:
                funcGen.registerCppFunc(this,"ColorSteps",CppVoid,this.getCppTypeDefinition(),config,this.generateFullSteps.bind(this));
                break;
            case ModDepth.LED_LINE:
                funcGen.registerCppFunc(this,"ColorLine",CppVoid,this.getCppTypeDefinition(),config,this.generateLine.bind(this));
                break;
        }
    }

    public generateCode(env: Environment, varSys: VariableSystem, cfg: ColorModuleConfig, funcSup: FunctionSupplier, isDirty: boolean): ModuleCode {
        // Gets the depth
        var depth = this.getConfigDepth(cfg);

        switch(depth){
            case ModDepth.SINGLE_LED:
                return {
                    loop: `leds[${cfg.start}] = CRGB(${cfg.clr_r},${cfg.clr_g},${cfg.clr_b})`,
                    isDirty: true
                }
            case ModDepth.LED_LINE:
                return {
                    loop: funcSup.getCppFuncCall(this,"ColorLine",cfg),
                    isDirty: cfg.delayPerLed <= 0
                };
            case ModDepth.FULL_STEPS:
                return {
                    loop: funcSup.getCppFuncCall(this,"ColorSteps",cfg),
                    isDirty: cfg.delayPerLed <= 0 && cfg.delayAfterStep <= 0
                };
        }
    }

    public simulateSetup(env: Environment, cfg: ColorModuleConfig, ssot: OpenObject, arduino: Arduino): void {
        ssot.clr = getHexFromRGB(cfg.clr_r,cfg.clr_g,cfg.clr_b);
    }

    public async simulateLoop(env: Environment, cfg: ColorModuleConfig, ssot: OpenObject, arduino: Arduino): Promise<void> {
        
        // Iterates over every step
        for(var step = 0; step < cfg.steps; step++){
            // For every led of that step
            for(var led = 0; led < cfg.ledsPerStep; led++){

                // Updates the color
                arduino.setLedHex(cfg.start+step * (cfg.space+cfg.ledsPerStep) + led, ssot.clr);
                
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

        // Updates the leds
        arduino.pushLeds(); 
    }

    public calculateRuntime(env: Environment, cfg: ColorModuleConfig) : number {
        // Checks if only a single led is given
        if(cfg.ledsPerStep === 1 && cfg.steps === 1)
            return 0;

        return (cfg.delayPerLed * cfg.ledsPerStep + cfg.delayAfterStep) * cfg.steps
    }

    public calculateMaxAccessedLed(env: Environment, cfg: ColorModuleConfig): PositiveNumber|void {
        return cfg.start+cfg.steps*cfg.ledsPerStep+(cfg.steps-1)*cfg.space-1 as PositiveNumber;
    }
}

export const ColorModule = new ColorModule_();