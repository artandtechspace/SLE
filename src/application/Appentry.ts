import { generateCode } from "./codegenerator/CodeGenerator.js";
import { validateObject } from "./codegenerator/ConfigValidator.js";

const toParse = `
{
    "modules": [
      {
        "name":"loop",
        "config": {
          "repeats": 5,
          "modules": [
            {
              "name": "color",
              "config": {
                  "ledsPerStep": 10,      
                  "rgb": "FF00aa"
              }
            },
            200
          ]
        }
      },

      "yoooo"
      
    ],
    "env": {
      "ledAmount": 50,
      "withComments": true,
      "pin": 6,
      "preprocessingCode": "#include <FastLED.h>\\n\\n#define LED_PIN $LED_PIN$\\n#define LED_AMT $LED_AMOUNT$\\n\\n// Fast-led api\\nCRGB leds[NUM_LEDS];\\n\\n$VARIABLES$\\n\\nvoid setup(){\\n    // Setups fastled-library\\n    FastLED.addLeds<NEOPIXEL, LED_PIN>(leds, LED_AMT);\\n    \\n    $SETUP_CODE$\\n}\\n\\nvoid loop(){\\n    // Loop-code\\n$RUN_CODE$\\n}"
    }
  }
  
  
`;


/**
 * Gets called once the general environment for the app got setup. Eg. the electron browser-window or the inbrowser setup got done.
 */
export default function onAppInitalize(){
    // Parses the config
    var [env, modsNConfigs] = validateObject(toParse);
            
    // Tries to generate the code
    var code = generateCode(env,modsNConfigs);

    // TODO: Export to file
    console.log("Generated code: \n\n"+code);
}