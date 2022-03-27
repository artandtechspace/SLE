import Environment from "../Environment";
import { VariableSystem } from "../variablesystem/VariableSystem";

// Constants that expose the types of the generators.
// Start-only can only run on start and will result in an error if called after any normal generators.
// and generate normal can use the setup, but will use the loop
export const GENERATOR_START_ONLY : Number = 1;
export const GENERATOR_NORMAL : Number = 0;

/**
 * SL-Gen is the element that takes in a configuration file and generate the code based on that.
 */

export class SLGen{

    /**
     * Returns when this code can run. If normale is used, the code can use the setup-function but will use the loop function to run continuesly.
     * But selecting a start_only generator to run after a start_normal generator, will result in an error. 
     */
    getType() : Number{
        return GENERATOR_NORMAL;
    }

    /**
     * Returns an object that contains all configurations that can be passed to the generator.
     * This is in the following format:
     * var-name: {
     *  type: (String) type of the variable or string-array if multiple types are allowed
     *  (Optional) validator: (function) that takes in a value as the parameter and returns if the given value is valid (true/false).
     * }
     */
    getConfigSkeleton() : Object{
        return {}
    }

    /**
     * This function is here to generate the code for the Arduino/Mc.
     * 
     * It returns an object with the following properties:
     * {
     * (Optional) setup: a string with the mc. setup-code that shall run once. If the function-type is start-only this is a required function.
     * loop: a string with the mc. loop-code that can continuesly run in the loop. If the generator-type is set to start-only this will be ignored.
     * 
     * }
     * 
     */
    generateCode(env : Environment, varSys : VariableSystem) : Object{
        return {}
    }
}