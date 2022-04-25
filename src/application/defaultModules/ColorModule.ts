import { Config } from "../Config.js";
import { Environment } from "../Environment.js";
import { VariableSystem } from "../variablesystem/VariableSystem.js";
import { ModuleBase } from "../modules/ModuleBase.js";
import { ModuleReturn } from "../modules/ModuleReturn.js";
import { isHexRGB, isInteger, printIf as pif } from "../utils/WorkUtils.js";
import { getFLEDColorDefinition } from "../utils/ColorUtils.js";
import { Arduino } from "../simulation/Arduino.js";

class ColorModule extends ModuleBase {

    private validateConfig(cfg: Config){
        // Gets the general variables
        var ledsPerStep:number = cfg.getRequired("ledsPerStep", val => isInteger(val, 1), "must be an integer >= 1");
        var start:number = cfg.getOptional("start", val => isInteger(val, 0), "must be an integer >= 0", 0);
        var space:number = cfg.getOptional("spaceBetweenSteps", val => isInteger(val, 0), "must be an integer >= 0", 0);
        var steps:number = cfg.getOptional("steps", val => isInteger(val, 1), "must be an integer >= 1", 1);

        // Gets the optional delays
        var delayPerLed:number = cfg.getOptional("delayLed",val=>isInteger(val,0),"must be an integer >= 0",0);
        var delayAfterStep:number = cfg.getOptional("delayStep",val=>isInteger(val,0),"must be an integer >= 0",0);

        // Gets the color
        var rgbHex = cfg.getRequired("rgb", isHexRGB, "must be an hex-color value in the format 'RRGGBB'");

        // Note: there is no check to alert the user if the animation is operation outside the bounds of the stripe-size.
        // This usually can just be ignored

        return {
            ledsPerStep,
            start,
            space,
            steps,
            delayPerLed,
            delayAfterStep,
            rgbHex
        }
    }

    public generateCode(env: Environment, varSys: VariableSystem, config: Config): string | ModuleReturn {

        // Validates the config
        var cfg = this.validateConfig(config);

            
        // Gets the color-string
        var [colorString, _] = getFLEDColorDefinition(cfg.rgbHex);

        // Start-addition operation
        var opStart = cfg.start > 0 ? (cfg.start + "+") : "";

        // Delay operations
        var opDelayLed = pif("\nFastLED.show();\ndelay("+cfg.delayPerLed+");",cfg.delayPerLed > 0);
        var opDelayStep = pif("\nFastLED.show();\ndelay("+cfg.delayAfterStep+");",cfg.delayAfterStep > 0);

        // Delay-bracket operations
        var opDelayLedBOpen = pif(" {",cfg.delayPerLed > 0);
        var opDelayLedBClose = pif("\n}",cfg.delayPerLed > 0);
        var opDelayStepBOpen = pif(" {",cfg.delayAfterStep > 0);
        var opDelayStepBClose = pif("\n}",cfg.delayAfterStep > 0);

        // Checks if there is only a singles step
        if (cfg.steps === 1) {

            // Checks if only a single led is required
            if (cfg.ledsPerStep === 1)
                return {
                    loop: `leds[${cfg.start}] = ${colorString};\nFastLED.show();`
                }
            else {
                // Requests the led variable
                var vLed = varSys.requestLocalVariable("int", "l", "0");

                return {
                    loop: `
                        for(${vLed.declair()} ${vLed} < ${cfg.ledsPerStep}; ${vLed}++)${opDelayLedBOpen}
                            leds[${opStart}${vLed}] = ${colorString};${opDelayLed}${opDelayLedBClose}
                        FastLED.show();
                    `
                }
            }
        } else {
            // Gets the variables
            var vStep = varSys.requestLocalVariable("int", "s", "0");
            var vLed = varSys.requestLocalVariable("int", "l", "0");
            
            return {
                loop: `
                for(${vStep.declair()} ${vStep} < ${cfg.steps}; ${vStep}++)${opDelayStepBOpen}
                    for(${vLed.declair()} ${vLed} < ${cfg.ledsPerStep}; ${vLed}++)${opDelayLedBOpen}
                        leds[${opStart}${vStep} * ${(cfg.space+cfg.ledsPerStep)} + ${vLed}] = ${colorString};${opDelayLed}${opDelayLedBClose}${opDelayStep}${opDelayStepBClose}
                FastLED.show();    
                `
            }
        }
    }


    public simulateSetup(env : Environment, config: Config, singleSourceOfTruth: {[k: string]: any}, arduino: Arduino){
        // Validates the config and stores it
        singleSourceOfTruth.cfg = this.validateConfig(config);
    }

    public async simulateLoop(env : Environment, singleSourceOfTruth: {[k: string]: any}, arduino: Arduino){

        // Gets the validated config
        var cfg = singleSourceOfTruth.cfg;
        
        // Iterates over every step
        for(var step = 0; step < cfg.steps; step++){
            // For every led of that step
            for(var led = 0; led < cfg.ledsPerStep; led++){

                // Updates the color
                arduino.setLedHex(cfg.start+step * (cfg.space+cfg.ledsPerStep) + led, cfg.rgbHex);
                
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
}

export default new ColorModule();