import { Config } from "../Config";
import { Environment } from "../Environment";
import { VariableSystem } from "../variablesystem/VariableSystem";
import { ModuleBase } from "../modules/ModuleBase";
import { ModuleReturn } from "../modules/ModuleReturn";
import { isHexRGB, isInteger, printIf as pif } from "../utils/WorkUtils";
import { getFLEDColorDefinition } from "../utils/ColorUtils";

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




        // How many leds of the stripe would be covered by the animation
        var anmCover = start+steps*(space+ledsPerStep);

        // Checks if the overall led-amount excedes the stripe length
        if(anmCover > env.ledAmount)
            throw "the animation covers the stripe up to pixel '"+anmCover+"' which is behind the last pixel '"+env.ledAmount+"'.";



            
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