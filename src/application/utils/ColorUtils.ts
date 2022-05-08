import { OpenObject } from "../types/Types";

// RGB-object
export interface RGB{
    r: number, // 0 - 255
    g: number, // 0 - 255
    b: number  // 0 - 255
}

// HSV-object
export interface HSV{
    h: number, // 0.00 - 1.00
    s: number, // 0.00 - 1.00
    v: number  // 0.00 - 1.00
}

// Contains all predefined colors of the fastled library.
const PREDEFINED_COLORS = {
    // Hex  : Constant-name
    "f0f8ff": "AliceBlue",
    "9966cc": "Amethyst",
    "faebd7": "AntiqueWhite",
    "00ffff": "Aqua",
    "7fffd4": "Aquamarine",
    "f0ffff": "Azure",
    "f5f5dc": "Beige",
    "ffe4c4": "Bisque",
    "000000": "Black",
    "ffebcd": "BlanchedAlmond",
    "0000ff": "Blue",
    "8a2be2": "BlueViolet",
    "a52a2a": "Brown",
    "deb887": "BurlyWood",
    "5f9ea0": "CadetBlue",
    "7fff00": "Chartreuse",
    "d2691e": "Chocolate",
    "ff7f50": "Coral",
    "6495ed": "CornflowerBlue",
    "fff8dc": "Cornsilk",
    "dc143c": "Crimson",
    "00008b": "DarkBlue",
    "008b8b": "DarkCyan",
    "b8860b": "DarkGoldenrod",
    "a9a9a9": "DarkGray",
    "006400": "DarkGreen",
    "bdb76b": "DarkKhaki",
    "8b008b": "DarkMagenta",
    "556b2f": "DarkOliveGreen",
    "ff8c00": "DarkOrange",
    "9932cc": "DarkOrchid",
    "8b0000": "DarkRed",
    "e9967a": "DarkSalmon",
    "8fbc8f": "DarkSeaGreen",
    "483d8b": "DarkSlateBlue",
    "2f4f4f": "DarkSlateGray",
    "00ced1": "DarkTurquoise",
    "9400d3": "DarkViolet",
    "ff1493": "DeepPink",
    "00bfff": "DeepSkyBlue",
    "696969": "DimGray",
    "1e90ff": "DodgerBlue",
    "b22222": "FireBrick",
    "fffaf0": "FloralWhite",
    "228b22": "ForestGreen",
    "ff00ff": "Fuchsia",
    "dcdcdc": "Gainsboro",
    "f8f8ff": "GhostWhite",
    "ffd700": "Gold",
    "daa520": "Goldenrod",
    "808080": "Gray",
    "008000": "Green",
    "adff2f": "GreenYellow",
    "f0fff0": "Honeydew",
    "ff69b4": "HotPink",
    "cd5c5c": "IndianRed",
    "4b0082": "Indigo",
    "fffff0": "Ivory",
    "f0e68c": "Khaki",
    "e6e6fa": "Lavender",
    "fff0f5": "LavenderBlush",
    "7cfc00": "LawnGreen",
    "fffacd": "LemonChiffon",
    "add8e6": "LightBlue",
    "f08080": "LightCoral",
    "e0ffff": "LightCyan",
    "fafad2": "LightGoldenrodYellow",
    "90ee90": "LightGreen",
    "d3d3d3": "LightGrey",
    "ffb6c1": "LightPink",
    "ffa07a": "LightSalmon",
    "20b2aa": "LightSeaGreen",
    "87cefa": "LightSkyBlue",
    "778899": "LightSlateGray",
    "b0c4de": "LightSteelBlue",
    "ffffe0": "LightYellow",
    "00ff00": "Lime",
    "32cd32": "LimeGreen",
    "faf0e6": "Linen",
    "800000": "Maroon",
    "66cdaa": "MediumAquamarine",
    "0000cd": "MediumBlue",
    "ba55d3": "MediumOrchid",
    "9370db": "MediumPurple",
    "3cb371": "MediumSeaGreen",
    "7b68ee": "MediumSlateBlue",
    "00fa9a": "MediumSpringGreen",
    "48d1cc": "MediumTurquoise",
    "c71585": "MediumVioletRed",
    "191970": "MidnightBlue",
    "f5fffa": "MintCream",
    "ffe4e1": "MistyRose",
    "ffe4b5": "Moccasin",
    "ffdead": "NavajoWhite",
    "000080": "Navy",
    "fdf5e6": "OldLace",
    "808000": "Olive",
    "6b8e23": "OliveDrab",
    "ffa500": "Orange",
    "ff4500": "OrangeRed",
    "da70d6": "Orchid",
    "eee8aa": "PaleGoldenrod",
    "98fb98": "PaleGreen",
    "afeeee": "PaleTurquoise",
    "db7093": "PaleVioletRed",
    "ffefd5": "PapayaWhip",
    "ffdab9": "PeachPuff",
    "cd853f": "Peru",
    "ffc0cb": "Pink",
    "cc5533": "Plaid",
    "dda0dd": "Plum",
    "b0e0e6": "PowderBlue",
    "800080": "Purple",
    "ff0000": "Red",
    "bc8f8f": "RosyBrown",
    "4169e1": "RoyalBlue",
    "8b4513": "SaddleBrown",
    "fa8072": "Salmon",
    "f4a460": "SandyBrown",
    "2e8b57": "SeaGreen",
    "fff5ee": "Seashell",
    "a0522d": "Sienna",
    "c0c0c0": "Silver",
    "87ceeb": "SkyBlue",
    "6a5acd": "SlateBlue",
    "708090": "SlateGray",
    "fffafa": "Snow",
    "00ff7f": "SpringGreen",
    "4682b4": "SteelBlue",
    "d2b48c": "Tan",
    "008080": "Teal",
    "d8bfd8": "Thistle",
    "ff6347": "Tomato",
    "40e0d0": "Turquoise",
    "ee82ee": "Violet",
    "f5deb3": "Wheat",
    "ffffff": "White",
    "f5f5f5": "WhiteSmoke",
    "ffff00": "Yellow",
    "9acd32": "YellowGreen",
    "ffe42d": "FairyLight",
    "ff9d2a": "FairyLightNCC"    
};

/**
 * Generates the hex-rgb string from the three colors
 * @param red 0-255
 * @param green 0-255
 * @param blue 0-255
 */
export function getHexFromRGB(red: number, green: number, blue: number) : string{
    return ((red<<16) | (green<<8) | blue).toString(16);;
}

/**
 * Takes in an RGB-hex-value and returns the c++ - expression used to get that color using the fastled-library. Constants are used when able to, otherwise the default hex code will be applied.
 * Returns first of all the expression and also if a constant was used.
 */
export function getFLEDColorDefinition(hex: string): [string,boolean]{

     // Gets the potencial constant's name
     var potName = PREDEFINED_COLORS[hex as keyof typeof PREDEFINED_COLORS];
 
     // Returns eighter the constant-name if found or the normal type declaration
     return [
         potName === undefined ? `0x${hex}` : ("CRGB::"+potName),
         potName !== undefined
     ];
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
export function HSVtoRGB(h: number, s: number, v: number) : RGB {
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
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
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
    var {r,g,b} = HSVtoRGB(h,s,v);  
    return `${withoutSharp ? "" : "#"}${decToHexTwoDigits(r)}${decToHexTwoDigits(g)}${decToHexTwoDigits(b)}`;
}

// Takes in an object and returns if that object is a valid HSV-object
export function isValidHUE(obj: OpenObject) : obj is HSV{
    
    // Checks for the keys
    if(Object.keys(obj).length !== 3 )
        return false;

    // Ensures that the names match
    if(obj["h"] === undefined || obj["s"] === undefined || obj["v"] === undefined)
        return false;

    return Object.values(obj).every(val=>typeof val === "number" && val >= 0 && val <= 1);
}