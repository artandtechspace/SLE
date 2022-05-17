import { Environment } from "../Environment.js";
import { VariableSystem } from "../variablesystem/VariableSystem.js";
import { Arduino } from "../simulation/Arduino.js";
import { Min, OpenObject, PositiveNumber as PositiveNumber, RGBNumber } from "../types/Types.js";
import { ModuleAsFuncBase } from "../modules/ModuleAsFuncBase.js";
import { CppTypeDefintion, CppFuncParams } from "../variablesystem/CppFuncDefs.js";
import { CppFloat, CppInt } from "../variablesystem/CppTypes.js";
import { printEquation } from "../utils/EquationHandler.js";

export type RainbowModuleConfig = {
    value: RGBNumber,

    // Here the Rainbow starts
    ledFrom: PositiveNumber,
    // How long the Rainbow is
    ledLength: Min<1>,

    // If the Rainbow is spread out over the x axis
    offsetPerLedInMs: number,

    // How many ms it takes until the rainbow is finished
    repeatLengthInMs: Min<500>,

    // How long the animation should play
    playLength: PositiveNumber
};

class RainbowModule_ extends ModuleAsFuncBase<RainbowModuleConfig> {

    // Default configuration
    public readonly DEFAULT_CONFIG: RainbowModuleConfig = {
        ledFrom: 0 as PositiveNumber,
        ledLength: 1 as Min<1>,
        offsetPerLedInMs: 0,
        playLength: 5000 as PositiveNumber,
        repeatLengthInMs: 500 as Min<500>,
        value: 255 as RGBNumber
    };

    constructor(){
        super("Rainbow")
    }

    public getCppTypeDefinition(): CppTypeDefintion<RainbowModuleConfig> {
        return {
            ledFrom: CppInt,
            ledLength: CppInt,
            offsetPerLedInMs: CppInt,
            playLength: CppInt,
            repeatLengthInMs: CppInt,
            value: CppFloat
        }
    }
    public isDirtyAfterExecution(env: Environment, cfg: RainbowModuleConfig, isDirty: boolean): boolean {
        return false;
    }

    public simulateSetup(env: Environment, cfg: RainbowModuleConfig, ssot: OpenObject, arduino: Arduino): void {
        ssot.value = cfg.value/255;
    }

    public async simulateLoop(env : Environment, cfg: RainbowModuleConfig, ssot: OpenObject, arduino: Arduino){
        // Calculates when to end the simulation
        var end = arduino.millis()+cfg.playLength;
        
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
            await arduino.delay(50);
        }
    }

    public calculateMaxAccessedLed(env: Environment, cfg: RainbowModuleConfig): PositiveNumber|void {
        return cfg.ledFrom+(cfg.ledLength-1) as PositiveNumber;
    }

    public calculateRuntime(env: Environment, config: RainbowModuleConfig): number {
        return config.playLength;
    }

    public generateFunctionCode(env: Environment, varSys: VariableSystem, prms: CppFuncParams<RainbowModuleConfig>): string {
        // Requests the end variable
        var vEnd = varSys.requestLocalVariable("long","end",`millis() + ${prms.playLength.value}`);
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
                delay(50);
            }
       `;
    }

}

export const RainbowModule = new RainbowModule_();