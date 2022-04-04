
import { generateCode } from "./slgenerator/CodeGenerator";
import { validateObject } from "./slgenerator/ConfigValidator";

import { readFile } from "fs";

// Default preprocessing code
const ppCode = `

#include <FastLED.h>

#define LED_PIN $LED_PIN$
#define LED_AMT $LED_AMOUNT$

// Fast-led api
CRGB leds[NUM_LEDS];

// Global variable setup
$VARIABLES$

void setup(){
    // Setups fastled-library
    FastLED.addLeds<NEOPIXEL, LED_PIN>(leds, LED_AMT);
    
    // Setup-code
    $SETUP_CODE$
}

void loop(){
    // Loop-code
$RUN_CODE$
}

`;

function onConfigRead(config: string){
    try{
        // Parses the config
        var [env, modsNConfigs] = validateObject(config);
        
        // Tries to generate the code
        var code = generateCode(env,modsNConfigs);

        // TODO: Export to file
        console.log("Generated code: \n\n"+code);
        
    }catch(e){
        console.log(e);
    }
}

function main(){

    // TODO: Take in file-argument
    // Gets the file-name
    var fn = process.argv[2] ?? "index.sle";

    // Tries to read in the content
    readFile(fn,function(err,data){
        if(err)
            console.log("Failed to load config from file '"+fn+"'. Do I have permissions to read and does that file exist?");
        else
            onConfigRead(data.toString());
    });
}

// Starts the program
main();

// Takes in the json-file


// Parses the modules

// Checks if the config work out

// Tries to generate the codes