import { Config } from "../Config.js";
import { Environment } from "../Environment.js";
import { ModuleBase } from "../modules/ModuleBase.js";
import ModuleManager from "../modules/ModuleManager.js";
import { isInteger } from "../utils/WorkUtils.js";
import SpecialCommentModule from "../modules/special/SpecialCommentModule.js";
import SpecialDelayModule from "../modules/special/SpecialDelayModule.js";


/**
 * Takes in the presumed json-element that has the environment configuration and tries to parse it to an environment.
 * @param json json-element with the presumed env-config
 * @returns if everything parses correctly the environment, otherwise a string with the error
 */
export function tryParseEnvironment(json: any) : Environment|string{

    // Checks the format of the config
    if(typeof json !== "object" || json.constructor.name !== "Object")
        return "The environment-configuration must be an object.";

    // Gets the required configs
    var leds = json["ledAmount"];
    var withComments = json["withComments"];
    var ledPin = json["pin"];
    var ppCode = json["preprocessingCode"];

    // Ensures that the leds are given
    if(!Number.isInteger(leds) || leds <= 0)
        return "The 'ledAmount' attribute must be a positiv integer > 0.";

    // Ensures that the led-pin is given
    if(!Number.isInteger(ledPin) || ledPin <= 0)
        return "The 'ledPin' attribute must be a positiv integer > 0.";

    // Checks the commands-flag
    if(typeof withComments !== "boolean")
        return "The 'withCommands' attribute must be a boolean true/false.";

    // Checks if the preprocessing-code is given
    if(typeof ppCode !== "string")
        return "The 'preprocessingCode' must be string.";

    // Gives back the created environment
    return new Environment(leds,withComments,ppCode,ledPin);
}

/**
 * Takes in an json-element which presumeably contains the json-config with all modules and settings.
 * @param json the json-element with the presumed config.
 * @returns if the parsing failes, the error message, otherwise all fully passed config's
 */
export function tryParseModules(json: any) : [ModuleBase, Config][]|string{

    // Checks the format of the config
    if(json === undefined || typeof json !== "object" || json.constructor.name !== "Array")
        return "The module-element's must be wrapped as objects inside of an array.";
    
    // List with all modules and their configs.
    var list: [ModuleBase, Config][] = [];

    // Iterates over all objects
    for(var modObj of json){       

        // Gets the type
        var type = typeof modObj;

        // Checks if the element is an object
        if(type !== "object"){

            // Checks the type
            switch(type){
                case "string":
                    // Registers a new comment module
                    list.push([SpecialCommentModule,new Config({
                        comment: modObj
                    })]);
                    continue;
                case "number":
                    // Checks if the number is valid
                    if(!isInteger(modObj,1))
                        return "Delay-function '"+modObj+"' must be an integer >= 1";
                    
                    // Registers a new delay module
                    list.push([SpecialDelayModule,new Config({
                        delay: modObj
                    })]);
                    continue;
            }

            return "Please write only modules and comments inside the array";
        }

        // Checks if the object has a name
        if(!("name" in modObj) || typeof modObj["name"] !== "string")
            return "Please specify a name on your module";

        // Gets the name
        var modName:string = modObj["name"];

        // Checks if a valid config object is given (This is optional)
        if("config" in modObj && typeof modObj["config"] !== "object")
            return "Config's must be objects. Error in module '"+modName+"'";

        // Gets the raw config
        var rawCfgObj = modObj["config"] || {};

        // Tries to get the module
        var mod:ModuleBase|undefined = ModuleManager.getModuleByName(modName);

        // Checks if the mod couldn't be found
        if(mod === undefined)
            return `Module '${modName}' couldn't be found.`;

        // Generates the config-object
        var config:Config = new Config(rawCfgObj);        

        // Appends
        list.push([mod,config]);
    }

    

    return list;
}

/**
 * Takes in a config and tries to pass the required configurations from it.
 * @param config a json-string or directly the json object with the config
 * @returns the full passed configuration.
 * 
 * @throws the string-message of any errors.
 */
export function validateObject(config: any) : [Environment,[ModuleBase, Config][]] {
    // Will contain the final json-object
    var obj;

    // Checks if the config already got passed
    if(typeof config === "object")
        obj = config;
    else{
        // Tries to parse the json config object
        try{
            // Tries to parse the config-object
            obj = JSON.parse(config);

            // Ensures that the element is an object
            if(typeof obj !== "object")
                throw null;
        }catch(e){
            throw "Please specify a valid json-string.";
        }
    }

    // Parses all config stuff
    var modsNConfigs = tryParseModules(obj["modules"]);
    var env = tryParseEnvironment(obj["env"]);

    // Checks if that failed
    if(typeof modsNConfigs === "string")
        throw modsNConfigs;
    else if(typeof env === "string")
        throw env;

    return [env, modsNConfigs];
}