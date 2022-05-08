import { Environment } from "../Environment.js";
import { Variable, VariableSystem } from "../variablesystem/VariableSystem.js";
import { ModuleBase } from "../modules/ModuleBase.js";
import { ModuleReturn } from "../modules/ModuleBase";
import { Arduino } from "../simulation/Arduino.js";
import { Min, OpenObject, PositiveNumber as PositiveNumber } from "../types/Types.js";
import { HSV } from "../utils/ColorUtils.js";
import { printIf as pIf } from "../utils/WorkUtils.js";
import { Equation, EquationSimplifier } from "../utils/EquationSimplifier.js";

export type GradientModuleConfig = {
    // The colors to fade between
    colorFrom: HSV,
    colorTo: HSV,

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

// Returns the hue-equation for the code-generator that is used if the hue-desition is before it's beginning
function getNegativeHueEquation(cfg: GradientModuleConfig,perc: Variable){
    // ((cfg.colorFrom.h + (cfg.colorTo.h + 1 - cfg.colorFrom.h) * perc) * 255) % 255
    return "(int)("+EquationSimplifier.simplifyEquation({
        num: 255,
        equations: [{
            num: (cfg.colorFrom.h),
            equations: [{
                num: (cfg.colorTo.h + 1 - cfg.colorFrom.h),
                vars: [perc]
            }]
        }]
    },EquationSimplifier.MUL)+") % 255";
}

// Returns the hue-equation for the code-generator that is used if the hue-desition is after it's beginning
function getPositiveHueEquation(cfg: GradientModuleConfig,perc: Variable){
    // ((cfg.colorTo.h - cfg.colorFrom.h) * perc + cfg.colorFrom.h) * 255
    return EquationSimplifier.simplifyEquation({
        num: 255,
        equations: [{
            num: cfg.colorFrom.h,
            equations: [{
                vars: [perc],
                num: (cfg.colorTo.h-cfg.colorFrom.h)
            }]
        }]
    }, EquationSimplifier.MUL);
}

// Returns the index-calulation code for the code-generation
function getIndexEquation(cfg: GradientModuleConfig, led: Variable){
    // cfg.ledFrom + (cfg.directionReversed ? (cfg.ledLength-led-1) : led)
    var rev = cfg.directionReversed;
    return EquationSimplifier.simplifyEquation({
        num: cfg.ledFrom + (rev ? (cfg.ledLength - 1) : 0),
        vars: (rev ? [] : [led]),
        equations: (rev ? [{
            num: -1,
            vars: [led]
        }] : [])
    },EquationSimplifier.ADD);
}

// Returns the calulation to get the next value for the given (Saturation or value) element
function getRangeCalction(get: (obj: HSV) => number, cfg: GradientModuleConfig, perc: Variable){
    // Gets start and stop number
    var start = get(cfg.colorFrom);
    var stop = get(cfg.colorTo);

    // (start + Math.abs(start - stop) * (start < stop ? 1 : -1) * perc) * 255;
    return EquationSimplifier.simplifyEquation({
        // Mul
        num: 255,
        equations:[{
            // Add
            num: start,
            equations: [{
                // Mul
                num: Math.abs(start-stop) * (start < stop ? 1 : -1),
                vars: [perc]
            }]
        }]
    },EquationSimplifier.MUL);
}

class GradientModule_ extends ModuleBase<GradientModuleConfig> {

    // Default configuration
    public readonly DEFAULT_CONFIG: GradientModuleConfig = {
        colorFrom: { h: 0, s: 1, v: 1 },
        colorTo: { h: 1, s: 1, v: 1 },
        ledFrom: 0 as PositiveNumber,
        ledLength: 5 as PositiveNumber,
        delayPerLed: 0 as PositiveNumber,
        directionReversed: false,
        colorReversed: false
    };

    public generateCode(env: Environment, varSys: VariableSystem, cfg: GradientModuleConfig, isDirty: boolean): ModuleReturn {

        // Requests the led variable
        var vLed = varSys.requestLocalVariable("int","led","0");


        // Requests the percentual-led state variable
        var vPercDec = `${cfg.directionReversed === cfg.colorReversed ? vLed.toString() : `(${cfg.ledLength-1}-${vLed})`}/(float)(${cfg.ledLength-1})`;
        var vPerc = varSys.requestLocalVariable("float", "perc", vPercDec);


        // Gets the calculator-string for the hue-value
        var hueCalculator = (cfg.colorFrom.h > cfg.colorTo.h ? getNegativeHueEquation : getPositiveHueEquation);


        // If the code contains a delay
        var hasDelay = cfg.delayPerLed > 0;

        return {
            loop: `

            for(${vLed.declair()} ${vLed} < ${cfg.ledLength}; ${vLed}++){
                ${vPerc.declair()}


                leds[${getIndexEquation(cfg,vLed)}] = CHSV(
                    ${hueCalculator(cfg, vPerc)},
                    ${getRangeCalction(obj=>obj.s,cfg ,vPerc)},
                    ${getRangeCalction(obj=>obj.v,cfg ,vPerc)}
                );

                ${pIf(`
                    delay(${cfg.delayPerLed});
                    FastLED.show();
                `,hasDelay)}

            }
            `,

            isDirty: (!hasDelay) || isDirty
        };
    }

    public simulateSetup(env: Environment, cfg: GradientModuleConfig, ssot: OpenObject, arduino: Arduino): void {
        // Multiplicator and range for saturation and value
        ssot.sMul = cfg.colorFrom.s < cfg.colorTo.s ? 1 : -1;
        ssot.sRange = Math.abs(cfg.colorFrom.s-cfg.colorTo.s);
        
        ssot.vMul = cfg.colorFrom.v < cfg.colorTo.v ? 1 : -1;
        ssot.vRange = Math.abs(cfg.colorFrom.v-cfg.colorTo.v);

        // Sets the hue-calculation function based on if the the color from is before or after the end-color
        ssot.hueFunc =
            cfg.colorFrom.h > cfg.colorTo.h ?
            (perc:number)=>((cfg.colorFrom.h+(cfg.colorTo.h+1-cfg.colorFrom.h)*perc) % 1) :
            (perc:number)=>(cfg.colorTo.h-cfg.colorFrom.h)*perc+cfg.colorFrom.h;
    }

    public async simulateLoop(env : Environment, cfg: GradientModuleConfig, ssot: OpenObject, arduino: Arduino){
        // Updates every led      
        for(var led = 0; led < cfg.ledLength; led++){
            // Gets the percentual state of the gradient (Also calculates if the direction or color is reversed and because if that if the percentage calculation must be different)
            var perc = ((cfg.directionReversed === cfg.colorReversed) ? led : (cfg.ledLength-1-led))/(cfg.ledLength-1);

            // Calculates the new hue
            var hue = ssot.hueFunc(perc);
            
            // Calculates saturation and value
            var saturation = cfg.colorFrom.s + ssot.sRange * perc * ssot.sMul;
            var value = cfg.colorFrom.v + ssot.vRange * perc * ssot.vMul;

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
}

export const GradientModule = new GradientModule_();