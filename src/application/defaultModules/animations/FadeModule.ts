import { Environment } from "../../Environment.js";
import { VariableSystem } from "../../codegenerator/variablesystem/VariableSystem.js";
import { Arduino } from "../../simulation/Arduino.js";
import { Min, OpenObject, PercentageNumber, PositiveNumber as PositiveNumber } from "../../types/Types.js";
import { ModuleAsFuncBase } from "../../modules/ModuleAsFuncBase.js";
import { CppTypeDefintion, CppFuncParams, CppFuncParam } from "../../codegenerator/variablesystem/CppFuncDefs.js";
import { CppFloat, CppInt } from "../../codegenerator/variablesystem/CppTypes.js";
import { printEquation } from "../../utils/EquationUtils.js";
import { getHUECalulationFunction } from "../../utils/ColorUtils.js";
import { generateHUECalculation, generateLinearScalingEquation as genLinScaleEQ } from "../../codegenerator/CommonCppCode.js";

export type FadeModuleConfig = {
    // The colors to fade between
    color_frm_h: PercentageNumber,
    color_frm_s: PercentageNumber,
    color_frm_v: PercentageNumber,

    color_to_h: PercentageNumber,
    color_to_s: PercentageNumber,
    color_to_v: PercentageNumber

    // Here the fade starts
    ledFrom: PositiveNumber,
    // How long the fade is
    ledLength: Min<1>,

    // How long the animation plays in general (in ms)
    playLengthInMs: PositiveNumber,
    
    // Offset in ms per led (in ms). This can also be nagative to reverse the direction
    offsetPerLedInMs: PositiveNumber,

    // How long it takes until the fade is compleated once (in ms)
    repeatLengthInMs: PositiveNumber,

    // How many ms delay are between updates.
    updateRateInMs: Min<5>
};

class FadeModule_ extends ModuleAsFuncBase<FadeModuleConfig> {

    // Default configuration
    public readonly DEFAULT_CONFIG: FadeModuleConfig = {
        color_frm_h: 0 as PercentageNumber,
        color_frm_s: 1 as PercentageNumber,
        color_frm_v: 1 as PercentageNumber,

        color_to_h: 1 as PercentageNumber,
        color_to_s: 1 as PercentageNumber,
        color_to_v: 1 as PercentageNumber,

        ledFrom: 0 as PositiveNumber,
        ledLength: 5 as Min<1>,
        playLengthInMs: 0 as PositiveNumber,
        offsetPerLedInMs: 50 as PositiveNumber,

        repeatLengthInMs: 5000 as PositiveNumber,
        updateRateInMs: 50 as Min<5>
    };

    constructor(){
        super("Fade")
    }

    public getCppTypeDefinition(): CppTypeDefintion<FadeModuleConfig> {
        return {
            color_frm_h: CppFloat,
            color_frm_s: CppFloat,
            color_frm_v: CppFloat,
            color_to_h: CppFloat,
            color_to_s: CppFloat,
            color_to_v: CppFloat,
            playLengthInMs: CppInt,
            ledFrom: CppInt,
            ledLength: CppInt,
            offsetPerLedInMs: CppInt,
            repeatLengthInMs: CppInt,
            updateRateInMs: CppInt
        }
    }

    public isDirtyAfterExecution(env: Environment, cfg: FadeModuleConfig, isDirty: boolean): boolean {
        return false;
    }

    public generateFunctionCode(env: Environment, varSys: VariableSystem, prms: CppFuncParams<FadeModuleConfig>): string {

        // Requests the end variable
        var vEnd = varSys.requestLocalVariable("long","end",`millis() + ${prms.playLengthInMs.value}`);
        // Requests the led variable
        var vLed = varSys.requestLocalVariable("short","led", "0");
        
        // Generates the percentage equation
        var percEq = `( ( millis() + $led * $offsetPerLed ) % $repeatLength) / (float)$repeatLength * 2`; 
        var percEqVals = {
            "offsetPerLed": prms.offsetPerLedInMs.value,
            "led": vLed,
            "repeatLength": prms.repeatLengthInMs.value
        };

        // Requests the percentual-led state variable
        var vPerc = varSys.requestLocalVariable("float", "perc", printEquation(percEq,percEqVals));

        return `
            ${vEnd.declair()}
            while(millis() < ${vEnd}){
                for(${vLed.declair()}${vLed} < ${prms.ledLength.value}; ${vLed}++){
                    ${vPerc.declair()}
                    if(${vPerc} > 1)
                        ${vPerc} = 1-(${vPerc}-1);
                    leds[${prms.ledFrom.value} + ${vLed}] = CHSV(
                        ${generateHUECalculation(vPerc,prms.color_frm_h,prms.color_to_h)},
                        ${genLinScaleEQ(vPerc,prms.color_frm_s,prms.color_to_s, 255)},
                        ${genLinScaleEQ(vPerc,prms.color_frm_v,prms.color_to_v, 255)}
                    );
                }
                FastLED.show();
                delay(${prms.updateRateInMs.value});
            }
    `;
    }

    public simulateSetup(env: Environment, cfg: FadeModuleConfig, ssot: OpenObject, arduino: Arduino): void {
        // Gets the hue-calculation function
        ssot.hueFunc = getHUECalulationFunction(cfg.color_frm_h, cfg.color_to_h);
    }

    public async simulateLoop(env : Environment, cfg: FadeModuleConfig, ssot: OpenObject, arduino: Arduino){        
        // Calculates when to end the simulation
        var end = arduino.millis()+cfg.playLengthInMs;

        // Plays the simulation until it's end
        while(arduino.millis() < end){
            // Updates every led
            for(var led = 0; led < cfg.ledLength; led++){
                // Calculates the current percentual state of the animation
                var perc = ((arduino.millis()+led*cfg.offsetPerLedInMs)%cfg.repeatLengthInMs)/cfg.repeatLengthInMs * 2;
        
                // Turns the percentage into a percentage that goes first from 0 to 1 and then slowly back from 1 to 0
                if(perc > 1)
                    perc = 1- (perc-1);

                // Calculates the new hue
                var hue = ssot.hueFunc(perc);
                
                // Calculates saturation and value
                var saturation = cfg.color_frm_s + perc * (cfg.color_to_s - cfg.color_frm_s);
                var value = cfg.color_frm_v + perc * (cfg.color_to_v - cfg.color_frm_v);

                // Gets the index of the led
                var index = cfg.ledFrom +  led;

                // Updates the led
                arduino.setLedHSV(index,hue,saturation,value);
            }
            
            // Sends the led update
            arduino.pushLeds();
            await arduino.delay(cfg.updateRateInMs);
        }

    }

    public calculateRuntime(env: Environment, config: FadeModuleConfig): number {
        return config.playLengthInMs;
    }

    public calculateMaxAccessedLed(env: Environment, config: FadeModuleConfig): void | PositiveNumber {
        return config.ledFrom+config.ledLength-1 as PositiveNumber;
    }

}

export const FadeModule = new FadeModule_();