import { Environment } from "../../Environment.js";
import { VariableSystem } from "../../codegenerator/variablesystem/VariableSystem.js";
import { Arduino } from "../../simulation/Arduino.js";
import { Min, OpenObject, PercentageNumber, PositiveNumber as PositiveNumber } from "../../types/Types.js";
import { printIf, printIfElse } from "../../utils/WorkUtils.js";
import { ModuleAsFuncBase } from "../../modules/ModuleAsFuncBase.js";
import { CppTypeDefintion, CppFuncParams } from "../../codegenerator/variablesystem/CppFuncDefs.js";
import { CppBool, CppFloat, CppInt } from "../../codegenerator/variablesystem/CppTypes.js";
import { tenaryBoolsEqual } from "../../codegenerator/CodeGenerationUtils.js";
import { printEquation } from "../../utils/EquationUtils.js";
import { getHUECalulationFunction } from "../../utils/ColorUtils.js";
import { generateHUECalculation, generateLinearScalingEquation as genLinScaleEQ } from "../../codegenerator/CommonCppCode.js";

export type GradientModuleConfig = {    
    // The colors to fade between
    color_frm_h: PercentageNumber,
    color_frm_s: PercentageNumber,
    color_frm_v: PercentageNumber,

    color_to_h: PercentageNumber,
    color_to_s: PercentageNumber,
    color_to_v: PercentageNumber

    // Here the gradient starts
    ledFrom: PositiveNumber,
    // How long the gradient is
    ledLength: Min<1>,

    // If the gradient is reversed in direction
    directionReversed: boolean,
    // If the colors are reversed
    colorReversed: boolean

    // Delay per led on the stripe (float)
    delayPerLed: PositiveNumber
};

class GradientModule_ extends ModuleAsFuncBase<GradientModuleConfig> {

    // Default configuration
    public readonly DEFAULT_CONFIG: GradientModuleConfig = {
        color_frm_h: 0 as PercentageNumber,
        color_frm_s: 1 as PercentageNumber,
        color_frm_v: 1 as PercentageNumber,

        color_to_h: 1 as PercentageNumber,
        color_to_s: 1 as PercentageNumber,
        color_to_v: 1 as PercentageNumber,

        ledFrom: 0 as PositiveNumber,
        ledLength: 5 as Min<1>,
        delayPerLed: 0 as PositiveNumber,
        directionReversed: false,
        colorReversed: false
    };

    constructor(){
        super("Gradient")
    }

    public generateFunctionCode(varSys: VariableSystem, prms: CppFuncParams<GradientModuleConfig>): string {
        // Requests the led variable
        var vLed = varSys.requestLocalVariable("int","led","0");


        // Gets the equation for the percentage-variable
        var vPercEquation = tenaryBoolsEqual(prms.directionReversed, prms.colorReversed,
            ()=> "$led",
            ()=> "($length -1 -$led)"
        )+"/(float)($length -1)";
        
        // Requests the percentual-led state variable
        var vPerc = varSys.requestLocalVariable("float", "perc", printEquation(vPercEquation,{
            "led": vLed,
            "length": prms.ledLength.value
        }));

        // Generates the hue equation
        var hueCalc = generateHUECalculation(vPerc,prms.color_frm_h,prms.color_to_h);

        // Gets the index of the next led
        // cfg.ledFrom + (cfg.directionReversed ? (cfg.ledLength-led-1) : led)
        var idxCalc = printEquation("$from + ("+tenaryBoolsEqual(prms.directionReversed,{ isStatic: true, value: true },
            ()=>"$length - $led -1",
            ()=>"$led"
        )+")",{
            "from": prms.ledFrom.value,
            "length": prms.ledLength.value,
            "led": vLed
        });
        

        // Generates the code
        return `
        for(${vLed.declair()} ${vLed} < ${prms.ledLength.value}; ${vLed}++){
            ${vPerc.declair()}

            leds[${idxCalc}] = CHSV(
                ${hueCalc},
                ${genLinScaleEQ(vPerc,prms.color_frm_s,prms.color_to_s, 255)},
                ${genLinScaleEQ(vPerc,prms.color_frm_v,prms.color_to_v, 255)}
            );

            ${printIfElse(
                printIf(`
                    delay(${prms.delayPerLed.value});
                    FastLED.show();`,
                    prms.delayPerLed.value > 0
                )
                ,
                `
                if(${prms.delayPerLed.value} > 0){
                    delay(${prms.delayPerLed.value});
                    FastLED.show();
                }
                `,
                prms.delayPerLed.isStatic
            )}

        }`;
    }


    public getCppTypeDefinition(): CppTypeDefintion<GradientModuleConfig> {
        return {
            colorReversed: CppBool,
            color_frm_h: CppFloat,
            color_frm_s: CppFloat,
            color_frm_v: CppFloat,
            color_to_h: CppFloat,
            color_to_s: CppFloat,
            color_to_v: CppFloat,
            delayPerLed: CppInt,
            directionReversed: CppBool,
            ledFrom: CppInt,
            ledLength: CppInt,
        }
    }

    public isDirtyAfterExecution(cfg: GradientModuleConfig, isDirty: boolean): boolean {
        return cfg.delayPerLed <= 0 || isDirty;
    }



    public simulateSetup(cfg: GradientModuleConfig, ssot: OpenObject, arduino: Arduino): void {
        // Gets the hue-calculation function
        ssot.hueFunc = getHUECalulationFunction(cfg.color_frm_h, cfg.color_to_h);
    }

    public async simulateLoop(cfg: GradientModuleConfig, ssot: OpenObject, arduino: Arduino){
        // Updates every led      
        for(var led = 0; led < cfg.ledLength; led++){
            // Gets the percentual state of the gradient (Also calculates if the direction or color is reversed and because if that if the percentage calculation must be different)
            var perc = ((cfg.directionReversed === cfg.colorReversed) ? led : (cfg.ledLength-1-led))/(cfg.ledLength-1);

            // Calculates the new hue
            var hue = ssot.hueFunc(perc);
            
            // Calculates saturation and value
            var saturation = cfg.color_frm_s + perc * (cfg.color_to_s - cfg.color_frm_s);
            var value = cfg.color_frm_v + perc * (cfg.color_to_v - cfg.color_frm_v);

            // Gets the index
            var index = cfg.ledFrom + (cfg.directionReversed ? (cfg.ledLength-led-1) : led);

            // Updates the led
            arduino.setLedHSV(index,hue,saturation,value);

            // Waits a given delay
            if(cfg.delayPerLed > 0){
                // Sends the led update
                arduino.pushLeds();
                await arduino.delay(cfg.delayPerLed);
            }
        }

        // Sends the led update
        arduino.pushLeds();
    }


    
    public calculateMaxAccessedLed(cfg: GradientModuleConfig): PositiveNumber|void {
        return cfg.ledFrom+cfg.ledLength-1 as PositiveNumber;
    }

    public calculateRuntime(config: GradientModuleConfig): number {
        return config.delayPerLed*config.ledLength;
    }

}

export const GradientModule = new GradientModule_();