import { Environment } from "../Environment";

// Hex-color regex
const HEX_COLOR_REG = /^[\da-fA-F]{1,6}$/gi;

/**
 * Takes in a comment and the current environment. Based on these settings the command will be printed or not.
 * @param comment which can be printed
 * @param env that determins if and how the comment will be printed.
 * @returns a string for string-interpolation.
 */
export function C(comment: string, env: Environment) : string{
    return env.withComments ? ("// "+comment+"\n") : "";
}

/**
 * Checks if the given element is an integer and if it is withing the specified range (if one got speicifed)
 * @param value the element that will be checked to be the integer. Can also be anything else.
 * @param min (Optional) the min value
 * @param max (Optional) the max value
 */
export function isInteger(value: any, min?: Number, max?: Number){
    // Ensures the element is a number
    if(!Number.isInteger(value))
        return false;

    // Checks if the value is valid
    if((min && value < min) || (max && value > max))
        return false;
    
    return true;
}

/**
 * Checks if the given value is a string and if that string is a hex-color
 * @param value the presumed hex-color-string
 */
export function isHexRGB(value: any){
    // Ensures the value is a string
    if(typeof value !== "string")
        return false;

    // Checks if the string is a hex-color
    return HEX_COLOR_REG.test(value);
}

/**
 * Prints an element only if the given condition is true
 */
export function printIf(element: string, condition: boolean) : string{
    return condition ? element : "";
}