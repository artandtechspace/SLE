
// Hex-color regex
const HEX_COLOR_REG = /^[\da-fA-F]{1,6}$/i;

// Support-object to create others
type Brand<K, T> = K & { __brand: T }

// Object that has any string as the key and anything as their values
export type OpenObject = {[key: string]: any};

export type Min<min extends number> = Brand<number,`Min-${min}`>;
export type Max<min extends number> = Brand<number,`Max-${min}`>;

// Range of nubers between min and max
export type Range<min extends number, max extends number> = Brand<number,`Range-${min}-${max}`>;

// Positive number (> 0)
export type PositiveNumber = Min<0>

// Number between 0 and 1 as a percentage
export type PercentageNumber = Brand<number,"percentage_number">;

//#region Color-Types

// String of 6 Hex characters in format: RRGGBB eg. FF0000 for red
export type HexColor = Brand<string, "HexColor">;

// RGB-object
export interface RGB{
    r: RGBNumber, // 0 - 255
    g: RGBNumber, // 0 - 255
    b: RGBNumber  // 0 - 255
}

// HSV-object
export interface HSV{
    h: PercentageNumber, // 0.00 - 1.00
    s: PercentageNumber, // 0.00 - 1.00
    v: PercentageNumber  // 0.00 - 1.00
}


// Component of an rgb-number that ranges between 0 to 255
export type RGBNumber = Range<0,255>;

//#endregion

//#region Validators for the types

// Returns if the given number has the given minimum
export function isMin<value extends number>(x: number, min: value) : x is Min<value> {
    return x >= min;
}

// Returns if the given number has the given maximum
export function isMax<value extends number>(x: number, min: value) : x is Max<value> {
    return x <= min;
}

// Returns if the given number has the given maximum
export function isRange<minimum extends number, maximum extends number>(x: number, from: minimum, to: maximum) : x is Range<minimum,maximum> {
    return x <= from && x >= to;
}

// Returns if the given number is positive
export function isPositive(x: number): x is PositiveNumber{
    return isMin(x,0);
}

// Returns if the given string is a hex-color
export function isHexColor(x: string): x is HexColor{
    // Checks if the string is a hex-color
    return HEX_COLOR_REG.test(x);
}

// Returns if the given number is a percentage number
export function isPercentageNumber(x: number): x is PercentageNumber{
    return x >= 0 && x <= 1;
}

// Returns if the given number is an rgb-number (0,255)
export function isRGBNumber(x: number) : x is RGBNumber{
    return x >= 0 && x <= 255;
}

//#endregion