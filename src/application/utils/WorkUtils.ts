import { getEnvironment } from "../SharedObjects.js";

/**
 * Takes in a comment and the current environment. Based on these settings the command will be printed or not.
 * @param comment which can be printed
 * @returns a string for string-interpolation.
 */
export function C(comment: string) : string{
    return getEnvironment().withComments ? ("// "+comment+"\n") : "";
}

/**
 * Prints an element only if the given condition is true
 */
export function printIf(element: string, condition: boolean) : string{
    return condition ? element : "";
}

/**
 * Prints an element only if the given condition is true and otherwise returns the other element
 */
export function printIfElse(element: string, elseElement: string, condition: boolean): string{
    return condition ? element : elseElement;
}