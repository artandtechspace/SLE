import { HSV, OpenObject, PercentageNumber, RGB, RGBNumber } from "../types/Types";
import { isNumberEV } from "./ElementValidation";

/**
 * Generates the hex-rgb string from the three colors
 * @param red 0-255
 * @param green 0-255
 * @param blue 0-255
 */
export function getHexFromRGB(red: number, green: number, blue: number) : string{
    // Generates the string
    var hexStr = ((red<<16) | (green<<8) | blue).toString(16);

    // Padds with leading zeros
    while(hexStr.length < 6)
        hexStr="0"+hexStr;

    return hexStr;
}

/**
 * Converts a HSV-Color into a RGB-Color
 * 
 * Modified version of: https://stackoverflow.com/a/17243070
 * @param {number} h Hue-Part (From 0.00 to 1.00)
 * @param {number} s Saturation-Part (From 0.00 to 1.00)
 * @param {number} v Value-Part (From 0.00 to 1.00)
 * @returns an object with keys of r, g and b and their respective values from 0 to 255
 */
export function HSV2RGB(h: number, s: number, v: number) : RGB {
    // Variable declaration
    var r, g, b, i, f, p, q, t;

    // Variable assignment
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);

    // Calculation
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
        default: r = g = b = 0;
    }

    // Return as RGB-Colors
    return {
        r: Math.round(r * 255) as RGBNumber,
        g: Math.round(g * 255) as RGBNumber,
        b: Math.round(b * 255) as RGBNumber
    };
}

/**
 * Takes in a decimal value, converts it to hex and pads the string with a zero if it has only a length of 1
 */
function decToHexTwoDigits(dec: number){
    var val = dec.toString(16);
    
    return (val.length <= 1 ? "0" : "") + val
}

/**
 * Converts a HSV-Color into a RGB-Color in the hex format: #RRGGBB.
 * @param {number} h Hue-Part (From 0.00 to 1.00)
 * @param {number} s Saturation-Part (From 0.00 to 1.00)
 * @param {number} v Value-Part (From 0.00 to 1.00)
 * @returns the hex-color in the following format: #RRGGBB
 */
export function HSV2HEX(h: number,s: number,v: number, withoutSharp=false){
    var {r,g,b} = HSV2RGB(h,s,v);  
    return `${withoutSharp ? "" : "#"}${decToHexTwoDigits(r)}${decToHexTwoDigits(g)}${decToHexTwoDigits(b)}`;
}

// Takes in an object and returns if that object is a valid HSV-object
export function isValidHSV(obj: OpenObject) : obj is HSV{
    
    // Checks for the keys
    if(Object.keys(obj).length !== 3 )
        return false;

    // Ensures that the names match
    if(obj["h"] === undefined || obj["s"] === undefined || obj["v"] === undefined)
        return false;

    return Object.values(obj).every(val=>isNumberEV(val) && val >= 0 && val <= 1);
}

/**
 * Takes in a hue-percentage value from and one to value.
 * Based on their positions, a function is returned that calculates a hue values based on a given percentage value of the progress of the animation.
 *
 * Basically this takes in start and end and returns a hue-calulator that calculates based on a percentage value.
 */
export function getHUECalulationFunction(from: PercentageNumber, to: PercentageNumber){
    return from > to ?
        (perc:PercentageNumber)=>((from+(to+1-from)*perc) % 1) :
        (perc:PercentageNumber)=>(to-from)*perc+from;
}