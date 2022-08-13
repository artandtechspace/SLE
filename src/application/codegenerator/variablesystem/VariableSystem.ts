import { Environment } from "../../Environment.js";
import { C } from "../../utils/WorkUtils.js";
import { UniqueNameSupplier } from "./UniqueNameSupplier.js";
import { Variable } from "./Variable.js";

export class VariableSystem {

    // Global variables that the system will automatically assign.
    private globalVars: Variable[] = [];

    // Supplier for unique names
    private unqSup: UniqueNameSupplier;

    constructor(uniqueSupplier: UniqueNameSupplier) {
        this.unqSup = uniqueSupplier;
    }

    /**
     * Generates the global variable code and returns that as a single string which must be printed at the top of the document.
     */
    public generateGlobalCode() : string{
        // TODO: Add language lookup
        return `${C("Global variable-declarations")}\n${this.globalVars.map(va=>va.declair()).join("\n")}`;
    }





    /**
     * Requests the variable-system to generate a valid name from the given configuration.
     * This can be done in multiple ways.
     * 
     * @param type the raw string variable type. Important: This is case-sensitiv. This will be used to determin based on the userers choosen configuration how the code will be generated or potional free variables reused.
     * @param name this is how the variable shall later be called in code. If the name is no longer available or the user has choosen a specific configuration that works against this principal, the name may result in a slightly or largely different style. For example name could result in name1 or name2 if already choosen or result in a completely different name if the user has choosen to reused free variables.
     * @param initValue the raw string that will be printed into the code after the equals sign. Could be new something, a string or just a single number.
     * @returns the variable
     */
    public requestLocalVariable(type: string, name: string, initValue: string = "null"): Variable {
        // Makes the name unique
        name = this.unqSup.getUniqueNameFor(name);

        // Gets the actual variable-object
        return new Variable(name,type,initValue);
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
        name = this.unqSup.getUniqueNameFor(name);

        // Gets the actual variable-object
        var va = new Variable(name,type,initValue);

        // Registers the global variable
        this.globalVars.push(va);

        return va;
    }
}