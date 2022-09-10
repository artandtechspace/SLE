import { handleProgrammingError } from "../errorSystem/ProgrammingErrorSystem.js";
import { LVarType } from "../language/LanguageManager.js";

 // All special-chars that are allowed within parameter names
 const SPECIAL_CHARS = "_$%".split("");

 // Returns if the given single char is a valid start for a parameter
export function isValidFirstCharacter(firstChar: string){
    // Ensures the element is defined
    if(firstChar === undefined)
        return false;

    // Checks alphabetic characters
    if((firstChar >= 'a' && firstChar <= 'z') || (firstChar >= 'A' && firstChar <= 'Z'))
        return true;

    return SPECIAL_CHARS.includes(firstChar);
}

// Returns if the given character is a valid middle-character for a variable-name
// This must be not the first character but can be the last
export function isValidMiddleCharacter(char: string){
    return isValidFirstCharacter(char) || (char >= '0' && char <= '9');
}

// Returns if the given name is a valid parameter name
export function isValidParameterName(fullname: string){
    // Ensures no undefined names or names with length 0
    if(fullname === undefined || fullname.length <= 0)
        return false;

    // Ensures the frist character is valid
    if(!isValidFirstCharacter(fullname[0]))
        return false;

    // Ensures every following character is a valid character
    for(var idx = 1; idx < fullname.length; idx++)
        if(!isValidMiddleCharacter(fullname[idx]))
            return false;
        
    return true;
}

/**
 * Takes in a parameter-name that is known is be invalid and returns the reason why it's invalid
 */
export function getParamInvalidNameErrorMessage(fullname: string) : [string, LVarType] {

    // Checks the first char
    if(!isValidFirstCharacter(fullname[0])){

        if(isValidMiddleCharacter(fullname[0]))
            return [
                "ui.parameter.errors.name.startchar",
                fullname[0]
            ];

        return [
            "ui.parameter.errors.name.invalidchar",
            fullname[0]
        ]
    }

    // Checks every following character
    for(var idx = 1; idx < fullname.length; idx++){
        if(!isValidMiddleCharacter(fullname[idx]))
            return [
                "ui.parameter.errors.name.invalidchar",
                fullname[idx]
            ]
    }

    // This part should never be reached
    return handleProgrammingError("An invalid-parametername had no errors. >;-|");
}