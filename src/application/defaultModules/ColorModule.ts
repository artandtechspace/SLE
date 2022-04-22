import { Config } from "../Config.js";
import { Environment } from "../Environment.js";
import { VariableSystem } from "../variablesystem/VariableSystem.js";
import { ModuleBase } from "../modules/ModuleBase.js";
import { ModuleReturn } from "../modules/ModuleReturn.js";
import { isHexRGB, isInteger, printIf as pif } from "../utils/WorkUtils.js";
import { getFLEDColorDefinition } from "../utils/ColorUtils.js";

class ColorModule extends ModuleBase {

    public generateCode(env: Environment, varSys: VariableSystem, config: Config): string | ModuleReturn {

        // Gets the general variables
        var ledsPerStep:number = config.getRequired("ledsPerStep", val => isInteger(val, 1), "must be an integer >= 1");
        var start:number = config.getOptional("start", val => isInteger(val, 0), "must be an integer >= 0", 0);
        var space:number = config.getOptional("spaceBetweenSteps", val => isInteger(val, 0), "must be an integer >= 0", 0);
        var steps:number = config.getOptional("steps", val => isInteger(val, 1), "must be an integer >= 1", 1);

        // Gets the optional delays
        var delayPerLed:number = config.getOptional("delayLed",val=>isInteger(val,0),"must be an integer >= 0",0);
        var delayAfterStep:number = config.getOptional("delayStep",val=>isInteger(val,0),"must be an integer >= 0",0);

        // Gets the color
        var rgbHex = config.getRequired("rgb", isHexRGB, "must be an hex-color value in the format 'RRGGBB'");


        // Note: there is no check to alert the user if the animation is operation outside the bounds of the stripe-size.
        // This usually can just be ignored

            
        // Gets the color-string
        var [colorString, _] = getFLEDColorDefinition(rgbHex);

        // Start-addition operation
        var opStart = start > 0 ? (start + "+") : "";

        // Delay operations
        var opDelayLed = pif("\nFastLED.show();\ndelay("+delayPerLed+");",delayPerLed > 0);
        var opDelayStep = pif("\nFastLED.show();\ndelay("+delayAfterStep+");",delayAfterStep > 0);

        // Delay-bracket operations
        var opDelayLedBOpen = pif(" {",delayPerLed > 0);
        var opDelayLedBClose = pif("\n}",delayPerLed > 0);
        var opDelayStepBOpen = pif(" {",delayAfterStep > 0);
        var opDelayStepBClose = pif("\n}",delayAfterStep > 0);

        // Checks if there is only a singles step
        if (steps === 1) {

            // Checks if only a single led is required
            if (ledsPerStep === 1)
                return {
                    loop: `leds[${start}] = ${colorString};\nFastLED.show();`
                }
            else {
                // Requests the led variable
                var vLed = varSys.requestLocalVariable("int", "l", "0");

                return {
                    loop: `
                        for(${vLed.declair()} ${vLed} < ${ledsPerStep}; ${vLed}++)${opDelayLedBOpen}
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
                for(${vStep.declair()} ${vStep} < ${steps}; ${vStep}++)${opDelayStepBOpen}
                    for(${vLed.declair()} ${vLed} < ${ledsPerStep}; ${vLed}++)${opDelayLedBOpen}
                        leds[${opStart}${vStep} * ${(space+ledsPerStep)} + ${vLed}] = ${colorString};${opDelayLed}${opDelayLedBClose}${opDelayStep}${opDelayStepBClose}
                FastLED.show();    
                `
            }
        }
    }
}

export default new ColorModule();