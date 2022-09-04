import { handleProgrammingError } from "../../errorSystem/ProgrammingErrorSystem.js";
import { isBooleanEV, isNumberEV, isStringEV } from "../../utils/ElementValidation.js";
import { CppReturnType, CppType } from "./CppFuncDefs.js";

// Defined cpp-types and cpp-return-types that are already implemented to be handled
export const CppFloat: CppType = "float" as CppType;
export const CppInt: CppType = "int" as CppType;
export const CppBool: CppType = "bool" as CppType;
export const CppVoid: CppReturnType = "void" as CppReturnType;
export const CppByte: CppType = "byte" as CppType;
// Special case: this doesn't pass the argument to the cpp-function and will
// therefor at least just like this be ignored
export const CppDontPass: CppType = "dont_pass" as CppType;

/**
 * Takes in a @param param cpp-type as the parameter type for a function and the @param value that shall be converted.
 * 
 * Returns the converted value that can be directly printed into the cpp-code's function call
 */
export function turnCppTypeToParameterCode(param: CppType, value: any){
    switch(param){
        case CppFloat:
            // Ensures the parameter is a number
            if(!isNumberEV(value) || isNaN(value))
                return handleProgrammingError("CppFloat got passed non-numeric value.")

            // Turns the number to it's sting value with always a number behin the decimal point
            return value.toFixed(8).replace(/0+$/gi,"0").replace(/\.$/gi,".0");
        case CppInt:
            // Checks if the parameter might be a hex-string
            if(isStringEV(value) && /^[\dA-Fa-f]+$/gi.test(value))
                return "0x"+value;

            // Ensures the parameter is a number
            if(!Number.isInteger(value))
                return handleProgrammingError("CppInt got passed non-numeric value.");

            return value.toString();
        case CppBool:
            if(!isBooleanEV(value))
                return handleProgrammingError("CppBool got passed non-boolean value.");

            return value.toString();
        case CppByte:
            
            // Ensures the parameter is a number
            if(!Number.isInteger(value))
                return handleProgrammingError("CppInt got passed non-numeric value.");

            // Ensures that the value is in range
            if(value < 0 || value > 255)
            return handleProgrammingError("CppByte got passed a value > 255 or < 0.");

            return value.toString();
        default:
            return handleProgrammingError("Invalid parameter type got passed to turnCppTypeToParameterCode");
    }
}