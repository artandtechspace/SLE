import { OpenObject } from "../types/Types";

// Returns if the element is an array
export function isArrayEV(element: any) : element is []{
    return typeof element === "object" && element.constructor.name === "Array";
}

// Returns if the element is an object
export function isObjectEV(element: any) : element is OpenObject{
    return typeof element === "object" && element !== null && element.constructor.name === "Object";
}

// Returns if the element is a boolean
export function isBooleanEV(element: any) : element is boolean{
    return typeof element === "boolean";
}

// Returns if the element is a number
export function isNumberEV(element: any) : element is number{
    return typeof element === "number";
}

// Returns if the element is an integer
export function isIntegerEV(element: any) : element is number{
    return Number.isInteger(element);
}

// Returns if the element is a string
export function isStringEV(element: any) : element is string{
    return typeof element === "string";
}