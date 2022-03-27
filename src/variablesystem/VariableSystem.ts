import Environment from "../Environment";

export class VariableSystem{

    // The configured environment to use.
    env : Environment;

    constructor(env: Environment){
        this.env = env;
    }

    /**
     * Requests the variable-system to generate a valid name from the given configuration.
     * This can be done in multiple ways.
     * 
     * @param type the raw string variable type. Important: This is case-sensitiv. This will be used to determin based on the userers choosen configuration how the code will be generated or potional free variables reused.
     * @param name this is how the variable shall later be called in code. If the name is no longer available or the user has choosen a specific configuration that works against this principal, the name may result in a slightly or largely different style. For example name could result in name1 or name2 if already choosen or result in a completely different name if the user has choosen to reused free variables.
     * @param initValue the raw string that will be printed into the code after the equals sign. Could be new something, a string or just a single number.
     * @returns an object with two entrys:
     * {
     *  name: the real variable name that can now directly be referenced inside the code.
     *  init: a string that must be print at the top of your local code to init the variable.
     * }
     */
    requestLocalVariable(type : string, name : string, initValue : string|undefined = undefined) : Object{
        // TODO
        return {};
    }

    /**
     * Requests the variable-system to generate a valid name from the given configuration.
     * This can be done in multiple ways.
     * 
     * @param type the raw string variable type. Important: This is case-sensitiv. This will be used to determin based on the userers choosen configuration how the code will be generated or potional free variables reused.
     * @param name this is how the variable shall later be called in code. If the name is no longer available or the user has choosen a specific configuration that works against this principal, the name may result in a slightly or largely different style. For example name could result in name1 or name2 if already choosen or result in a completely different name if the user has choosen to reused free variables.
     * @param initValue the raw string that will be printed into the code after the equals sign. Could be new something, a string or just a single number.
     * @returns an object with two entrys:
     * {
     *  name: the real variable name that can now directly be referenced inside the code.
     *  init: a string that must be print at the top of your local code to init the variable.
     * }
     */
    requestGlobalVariable(type : string, name : string, initValue : string|undefined = undefined) : Object{
        // TODO
        return {};
    }
}