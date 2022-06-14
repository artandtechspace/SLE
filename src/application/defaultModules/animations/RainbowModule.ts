import { Environment } from "../../Environment.js";
import { VariableSystem } from "../../codegenerator/variablesystem/VariableSystem.js";
import { Arduino } from "../../simulation/Arduino.js";
import { Min, OpenObject, PositiveNumber as PositiveNumber, RGBNumber } from "../../types/Types.js";
import { ModuleAsFuncBase } from "../../modules/ModuleAsFuncBase.js";
import { CppTypeDefintion, CppFuncParams } from "../../codegenerator/variablesystem/CppFuncDefs.js";
import { CppFloat, CppInt } from "../../codegenerator/variablesystem/CppTypes.js";
import { printEquation } from "../../utils/EquationUtils.js";

export type RainbowModuleConfig = {
    // HSV-value part for the whole rainbow
    value: RGBNumber,

    // Here the Rainbow starts
    ledFrom: PositiveNumber,
    // How long the Rainbow is
    ledLength: Min<1>,

    // If the Rainbow is spread out over the x axis (in ms). This can also be a negative number to reverse the direction
    offsetPerLedInMs: number,

    // How many ms it takes until the rainbow is finished (in ms)
    repeatLengthInMs: Min<500>,

    // How long the animation should play (in ms)
    playLengthInMs: PositiveNumber,

    // How many ms delay are between updates.
    updateRateInMs: PositiveNumber
};

class RainbowModule_ extends ModuleAsFuncBase<RainbowModuleConfig> {

    // Default configuration
    public readonly DEFAULT_CONFIG: RainbowModuleConfig = {
        ledFrom: 0 as PositiveNumber,
        ledLength: 1 as Min<1>,
        offsetPerLedInMs: 0,
        playLengthInMs: 5000 as PositiveNumber,
        repeatLengthInMs: 500 as Min<500>,
        value: 255 as RGBNumber,
        updateRateInMs: 50 as PositiveNumber
    };

    constructor(){
        super("Rainbow")
    }

    public getCppTypeDefinition(): CppTypeDefintion<RainbowModuleConfig> {
        return {
            ledFrom: CppInt,
            ledLength: CppInt,
            offsetPerLedInMs: CppInt,
            playLengthInMs: CppInt,
            repeatLengthInMs: CppInt,
            value: CppFloat,
            updateRateInMs: CppInt
        }
    }
    public isDirtyAfterExecution(cfg: RainbowModuleConfig, isDirty: boolean): boolean {
        return false;
    }

    public simulateSetup(cfg: RainbowModuleConfig, ssot: OpenObject, arduino: Arduino): void {
        ssot.value = cfg.value/255;
    }

    public async simulateLoop(cfg: RainbowModuleConfig, ssot: OpenObject, arduino: Arduino){
        // Calculates when to end the simulation
        var end = arduino.millis()+cfg.playLengthInMs;
        
        // Repeats the required amount of times
        while(arduino.millis() < end){
            // Updates every led      
            for(var led = 0; led < cfg.ledLength; led++){
                // Generates the current percentage
                var perc = ((arduino.millis()+cfg.offsetPerLedInMs*led)%cfg.repeatLengthInMs)/cfg.repeatLengthInMs;
                
                // Updates the color
                arduino.setLedHSV(led+cfg.ledFrom,perc,1,ssot.value);
            }

            // Sends the update
            arduino.pushLeds();

            // Waits
            await arduino.delay(cfg.updateRateInMs);
        }
    }

    public calculateMaxAccessedLed(cfg: RainbowModuleConfig): PositiveNumber|void {
        return cfg.ledFrom+(cfg.ledLength-1) as PositiveNumber;
    }

    public calculateRuntime(config: RainbowModuleConfig): number {
        return config.playLengthInMs;
    }

    public generateFunctionCode(varSys: VariableSystem, prms: CppFuncParams<RainbowModuleConfig>): string {
        // Requests the end variable
        var vEnd = varSys.requestLocalVariable("long","end",`millis() + ${prms.playLengthInMs.value}`);
        // Requests the led variable
        var vLed = varSys.requestLocalVariable("short","led", "0");
       
        // Equation for the percentage-calculation
        var percEq = "255 * ((millis() + $offsetLed * $led) % $repeatLength) / $repeatLength";
        var percEqVals = {
            "offsetLed": prms.offsetPerLedInMs.value,
            "led": vLed,
            "repeatLength": prms.repeatLengthInMs.value
        };
       
        return `
            ${vEnd.declair()}
            while(millis() < ${vEnd}){
                for(${vLed.declair()}${vLed} < ${prms.ledLength.value}; ${vLed}++){
                    leds[${prms.ledFrom.value} + ${vLed}] = CHSV(
                        ${printEquation(percEq,percEqVals)},
                        255,
                        ${prms.value.value}
                    );
                }
                FastLED.show();
                delay(${prms.updateRateInMs.value});
            }
       `;
    }

}

export const RainbowModule = new RainbowModule_();