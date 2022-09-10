/**
 * Contains all definitions that are required for the function-system to work
 */

import { ModuleBase } from "../../modules/ModuleBase.js";
import { Variable } from "./Variable.js";
import { VariableSystem } from "./VariableSystem.js";


// Strings that are cpp-datatypes (float, int, string, etc.)
export type CppType = string & { __brand: "funcParam" };

// Strings that are cpp-function-returnable-datatypes (float, int, void, etc.)
export type CppReturnType = CppType;



/**
 * Takes in a "parent" object and requires for every key on that object to give a specific cpp-type that can represent it
 * 
 * Eg.:
 * {
 *  x: number,
 *  name: string
 * }
 * 
 * would result in a cpp-type-definition that must have the keys x and name
 * eg.:
 * {
 *  x: CppFloat (or CppInt)
 *  name: CppString
 * }
 */
export type CppTypeDefintion<X> = { [key in keyof X]: CppType }


// Cpp-function-parameter for the code-generator that represents a dynamic config value
export type CppFuncParam<T> = {
    isStatic: boolean;
    value: Variable | T;
}

/**
 * A collection of CppFuncParams for every type of the given config.
 */
export type CppFuncParams<T>= {[key in keyof T]: CppFuncParam<T[key]>};

// Function to generate the cpp-function code with a given set of cpp-parameters
export type CppFuncGeneratorFunction<T> = (varSys: VariableSystem, funcParams: CppFuncParams<T>) => string;

// Condenced information for the function-supplyer
export interface CppFuncSupply<T>{[key: string]: {
    header: string,
    functionParameters: {[key: string]: CppFuncParam<any>},
    callParameters: string[],
    typeDef: CppTypeDefintion<T>,
    module: ModuleBase<any>,
    onGenerate: CppFuncGeneratorFunction<T>,
    callName: string
}}

// Condenced information of a cpp-function-register
export interface CppFuncRegister<T>{
    typeDef: CppTypeDefintion<T>,
    configs: T[],
    module: ModuleBase<any>,
    onGenerate: CppFuncGeneratorFunction<T>,
    returnType: CppReturnType,
    name: string
}