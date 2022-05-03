import { isHexRGB } from "../utils/WorkUtils.js";

export type Brand<K, T> = K & { __brand: T }
export type OpenObject = {[key: string]: any};

export type Min<min extends number> = Brand<number,`Min-${min}`>;
export type Max<min extends number> = Brand<number,`Max-${min}`>;
export type Range<min extends number, max extends number> = Brand<number,`Range-${min}-${max}`>;
export type PositiveNumber = Min<0>

export type HexColor = Brand<string, "HexColor">;

//#region Validators for the types

// Returns if the given number has the given minimum
export function isMin<value extends number>(x: number, m: value) : x is Min<value> {
    return x >= m;
}

// Returns if the given number has the given maximum
export function isMax<value extends number>(x: number, m: value) : x is Max<value> {
    return x <= m;
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
    return isHexRGB(x);
}

//#endregion