import { ModuleBase } from "../../modules/ModuleBase.js";
import { CppFuncSupply } from "./CppFuncDefs.js";
import { VariableSystem } from "./VariableSystem.js";
import { CppDontPass, turnCppTypeToParameterCode } from "./CppTypes.js";

export class FunctionSupplier{

    // Contains all registered function with some base informations
    private functions: CppFuncSupply<any>;

    constructor(functions: CppFuncSupply<any>){
        this.functions = functions;
    }

    /**
     * Generates the cpp-function-code to print above all function calls in the final cpp-code.
     */
    public generateCppFuncDefinitions(varSys: VariableSystem) : string{
        // Contains the final generated code
        var code = "";

        // Generates all functions
        for(var name in this.functions){
            var func = this.functions[name];


            // Generates the body
            var body = func.onGenerate(varSys,func.functionParameters);
            
            // Generates the full function definition
            code += `

            ${func.header} {
                ${body}
            }`;
        }

        return code;
    }

    /**
     * Takes in the requester, name and it's config and returns the string that is used to call the required and previously registered function
     */
    public getCppFuncCall<T>(requester: ModuleBase<any>, name: string, cfg: T) : string{
        // Gets the function-key/name
        var key = requester.constructor.name+"_"+name;

        // Gets the function
        var func = this.functions[key];

        // Generates the string with all parameters to call the function (Filter out all the dont-pass parameters)
        var callParams = func.callParameters
            .filter(key=>func.typeDef[key] !== CppDontPass)
            .map(key=>turnCppTypeToParameterCode(func.typeDef[key], cfg[key as keyof typeof cfg]))
            .join(",");
        
        return `${func.callName}(${callParams});`;
    }
}