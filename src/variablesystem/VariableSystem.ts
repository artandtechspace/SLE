import { Environment } from "../Environment";
import { C } from "../utils/WorkUtils";

/**
 * When calling the toString method (eg. when using string-interpolation) this will just return the plain old variable-name.
 * That means that the following call:
 * 
 * var va = new Variable(...);
 * var code = `
 *    ${va}++;
 *    print(${va})
 * `
 * 
 * would work perfectly fine.
 */
class Variable {
    public name: string;
    public type: string;
    public initValue: string;

    constructor(name: string, type: string, initValue: string) {
        this.name = name;
        this.type = type;
        this.initValue = initValue;
    }

    /**
     * @returns statement to declair the variable.
     */
    declair(){
        return this.type+" "+this.assign;
    }

    /**
     * @returns statement to (re)assignes the variable.
     */
    assign(){
        return `${this.name} = ${this.initValue};`;
    }

    toString(){
        return this.name;
    }
}

export class VariableSystem {

    // The configured environment to use
    private env: Environment;

    // Global variables that the system will automatically assign.
    private globalVars: Variable[] = [];

    // Already used variable-names
    private usedNames : string[] = [];

    constructor(env: Environment) {
        this.env = env;
    }

    /**
     * Generates the global variable code and returns that as a single string which must be printed at the top of the document.
     */
    public generateGlobalCode() : string{
        return `${C("Global variable-declarations",this.env)}\n${this.globalVars.map(va=>va.declair()).join("\n")}`;
    }





    /**
     * Gets a unique name for the given variable-name.
     * @param name the original variable-name that must be made unique
     */
    private getUniqueNameFor(name: string) {
        // Next name to test
        var nameIteration = name;

        // Current next index for the name
        var indexIteration = 1;

        // Searches until a valid name got found.
        while (true) {
            // Checks if the name already exists
            if (this.usedNames.filter(nm => nm === nameIteration).length >= 1){
                // Advances the name
                nameIteration = name+(indexIteration++);
                continue;
            }

            // Returns the name
            return nameIteration;
        }
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
    public requestLocalVariable(type: string, name: string, initValue: string = "null"): Variable {
        // Makes the name unique
        name = this.getUniqueNameFor(name);

        // Gets the actual variable-object
        var va = new Variable(name,type,initValue);

        // Registers the local variable
        this.usedNames.push(va.name);
        return va;
    }

    /**
     * Requests the variable-system to generate a valid name from the given configuration.
     * This can be done in multiple ways.
     * 
     * @param type the raw string variable type. Important: This is case-sensitiv. This will be used to determin based on the userers choosen configuration how the code will be generated or potional free variables reused.
     * @param name this is how the variable shall later be called in code. If the name is no longer available or the user has choosen a specific configuration that works against this principal, the name may result in a slightly or largely different style. For example name could result in name1 or name2 if already choosen or result in a completely different name if the user has choosen to reused free variables.
     * @param initValue the raw string that will be printed into the code after the equals sign. Could be new something, a string or just a single number.
     * @returns the variable-object for the global variable. This must not be declaired or assigned as this will automatically happen. Be sure to see the Variable-class as well.
     */
    public requestGlobalVariable(type: string, name: string, initValue: string = "null"): Variable {
        
        // Ensures that the variable name not already got used.
        name = this.getUniqueNameFor(name);

        // Gets the actual variable-object
        var va = new Variable(name,type,initValue);

        // Registers the global variable
        this.globalVars.push(va);
        this.usedNames.push(va.name);

        return va;
    }
}