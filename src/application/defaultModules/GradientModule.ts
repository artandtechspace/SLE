import { Environment } from "../Environment.js";
import { VariableSystem } from "../variablesystem/VariableSystem.js";
import { Arduino } from "../simulation/Arduino.js";
import { OpenObject, PositiveNumber as PositiveNumber } from "../types/Types.js";
import { printIf, printIfElse } from "../utils/WorkUtils.js";
import { Variable } from "../variablesystem/Variable.js";
import { ModuleAsFuncBase } from "../modules/ModuleAsFuncBase.js";
import { CppTypeDefintion, CppFuncParams, CppFuncParam } from "../variablesystem/CppFuncDefs.js";
import { CppBool, CppFloat, CppInt } from "../variablesystem/CppTypes.js";
import { tenaryBoolsEqual, tenaryLargerThan } from "../utils/CodeGenerationUtils.js";
import { printEquation } from "../utils/EquationHandler.js";

export type GradientModuleConfig = {    
    // The colors to fade between
    color_frm_h: number,
    color_frm_s: number,
    color_frm_v: number,

    color_to_h: number,
    color_to_s: number,
    color_to_v: number

    // Here the gradient starts
    ledFrom: PositiveNumber,
    // How long the gradient is
    ledLength: PositiveNumber,

    // If the gradient is reversed in direction
    directionReversed: boolean,
    // If the colors are reversed
    colorReversed: boolean

    // Delay per led on the stripe
    delayPerLed: PositiveNumber
};

class GradientModule_ extends ModuleAsFuncBase<GradientModuleConfig> {

    // Default configuration
    public readonly DEFAULT_CONFIG: GradientModuleConfig = {
        color_frm_h: 0,
        color_frm_s: 1,
        color_frm_v: 1,

        color_to_h: 1,
        color_to_s: 1,
        color_to_v: 1,

        ledFrom: 0 as PositiveNumber,
        ledLength: 5 as PositiveNumber,
        delayPerLed: 0 as PositiveNumber,
        directionReversed: false,
        colorReversed: false
    };

    constructor(){
        super("Gradient")
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
    public isDirtyAfterExecution(env: Environment, cfg: GradientModuleConfig, isDirty: boolean): boolean {
        return cfg.delayPerLed <= 0 || isDirty;
    }

    public simulateSetup(env: Environment, cfg: GradientModuleConfig, ssot: OpenObject, arduino: Arduino): void {
        // Sets the hue-calculation function based on if the the color from is before or after the end-color
        ssot.hueFunc =
            cfg.color_frm_h > cfg.color_to_h ?
            (perc:number)=>((cfg.color_frm_h+(cfg.color_to_h+1-cfg.color_frm_h)*perc) % 1) :
            (perc:number)=>(cfg.color_to_h-cfg.color_frm_h)*perc+cfg.color_frm_h;
    }

    public async simulateLoop(env : Environment, cfg: GradientModuleConfig, ssot: OpenObject, arduino: Arduino){
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

    public calculateMaxAccessedLed(env: Environment, cfg: GradientModuleConfig): PositiveNumber|void {
        return cfg.ledFrom+(cfg.ledLength-1) as PositiveNumber;
    }

    public calculateRuntime(env: Environment, config: GradientModuleConfig): number {
        return config.delayPerLed*config.ledLength;
    }

    private getPositiveHueCalc(perc: Variable, prms: CppFuncParams<GradientModuleConfig>){
        // ((cfg.color_frm_h + (cfg.color_to_h + 1 - cfg.color_frm_h) * perc) * 255) % 255
        return printEquation(
            "(int)(255 * ( $clrFrm + ($clrTo + 1 - $clrFrm) * $perc)) % 255",
            {
                "clrFrm": prms.color_frm_h.value,
                "clrTo": prms.color_to_h.value,
                "perc": perc
            }
        );
    }

    private getNegativeHueCalc(perc: Variable, prms: CppFuncParams<GradientModuleConfig>){
        // ((cfg.color_to_h - cfg.color_frm_h) * perc + cfg.color_frm_h) * 255
        return printEquation(
            "255 * ($clrFrm + $perc * ($clrTo - $clrFrm))",
            {
                "clrFrm": prms.color_frm_h.value,
                "clrTo": prms.color_to_h.value,
                "perc": perc
            }
        );
    }

    public generateFunctionCode(env: Environment, varSys: VariableSystem, prms: CppFuncParams<GradientModuleConfig>): string {
        // Requests the led variable
        var vLed = varSys.requestLocalVariable("int","led","0");


        // Gets the equation for the percentage-variable
        var vPercEquation = tenaryBoolsEqual(prms.directionReversed, prms.colorReversed,
            ()=> "$led/(float)($length -1)",
            ()=> "($length -1 -$led)/(float)($length -1)"
        );
        
        // Requests the percentual-led state variable
        var vPerc = varSys.requestLocalVariable("float", "perc", printEquation(vPercEquation,{
            "led": vLed,
            "length": prms.ledLength.value
        }));

        // Gets the calculator-string for the hue-value
        var hueCalc: string = tenaryLargerThan(prms.color_frm_h,prms.color_to_h,
            ()=>this.getPositiveHueCalc(vPerc,prms),
            ()=>this.getNegativeHueCalc(vPerc,prms)
        ) as string;



        // Value and Saturation calulation
        var valSatCalc = "255 * ($from + $perc * ($to - $from))";
        var satCalc: string = printEquation(valSatCalc,{
            "perc": vPerc,
            "from": prms.color_frm_s.value,
            "to": prms.color_to_s.value
        });
        var valCalc: string = printEquation(valSatCalc,{
            "perc": vPerc,
            "from": prms.color_frm_v.value,
            "to": prms.color_to_v.value
        });

        // Gets the index of the next led
        // cfg.ledFrom + (cfg.directionReversed ? (cfg.ledLength-led-1) : led)
        var idxCalc = printEquation("$from + "+tenaryBoolsEqual(prms.directionReversed,{ isStatic: true, value: true },
            ()=>"$length - $led -1",
            ()=>"$led"
        ),{
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
                ${satCalc},
                ${valCalc}
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

}

export const GradientModule = new GradientModule_();