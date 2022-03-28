import { Environment } from "../Environment";


/**
 * Takes in a comment and the current environment. Based on these settings the command will be printed or not.
 * @param comment which can be printed
 * @param env that determins if and how the comment will be printed.
 * @returns a string for string-interpolation.
 */
export function CMT(comment: string, env: Environment) : string{
    return env.withComments ? ("// "+comment) : "";
}