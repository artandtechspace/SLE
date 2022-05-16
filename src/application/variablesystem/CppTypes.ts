import { SystemError } from "../errorSystem/Error.js";
import { CppReturnType, CppType } from "./CppFuncDefs.js";

// Defined cpp-types and cpp-return-types that are already implemented to be handled
export const CppFloat: CppType = "float" as CppType;
export const CppInt: CppType = "int" as CppType;
export const CppBool: CppType = "bool" as CppType;
export const CppVoid: CppReturnType = "void" as CppReturnType;

/**
 * Takes in a @param param cpp-type as the parameter type for a function and the @param value that shall be converted.
 * 
 * Returns the converted value that can be directly printed into the cpp-code's function call
 * 
 * @throws {SystemError} if the value is invalid or unsuited for the given Cpp-Type (This should never happen)
 */
export function turnCppTypeToParameterCode(param: CppType, value: any){
    switch(param){
        case CppFloat:
            // Ensures the parameter is a number
            if(typeof value !== "number" || isNaN(value))
                throw new SystemError("CppFloat got passed non-numeric value.");

            // Turns the number to it's sting value with always a number behin the decimal point
            return value.toFixed(8).replace(/0+$/gi,"0").replace(/\.$/gi,".0");
        case CppInt:
            // Checks if the parameter might be a hex-string
            if(typeof value === "string" && /^[\dA-Fa-f]+$/gi.test(value))
                return "0x"+value;

            // Ensures the parameter is a number
            if(!Number.isInteger(value))
                throw new SystemError("CppInt got passed non-numeric value.");
            return value.toString();
        case CppBool:
            if(typeof value !== "boolean")
                throw new SystemError("CppBool got passed non-boolean value.");
            return value.toString();
        case CppVoid:
            throw new SystemError("CppVoid cant be passed as an argument.");
        default:
            throw "Invalid parameter type got passed.";
    }
}