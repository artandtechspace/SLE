/**
 * Contains all definitions that are required for the function-system to work
 */

import { Environment } from "../Environment.js";
import { ModuleBase } from "../modules/ModuleBase.js";
import { Variable } from "./Variable.js";
import { VariableSystem } from "./VariableSystem.js";


// Strings that are cpp-datatypes (float, int, string, etc.)
export type CppType = string & { __brand: "funcParam" };

// Strings that are cpp-returnable-datatypes (float, int, void, etc.)
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


/**
 * If every cpp-func-call of the given function would have the same parameter, it can be removed and just directly be appended into the function.
 * This is what this type is about.
 * 
 * If the "isStatic" value is true, every call of the function has the same value (Which in that case would be inside the value-variable of th type).
 * If it's false, a variable is stored in it's place instead an can be called to get the value for the current function-call. 
 */
export type CppFuncParam<T> = {
    isStatic: boolean;
    value: Variable | T;
}


export type CppFuncParams<T>= {[key in keyof T]: CppFuncParam<T[key]>};


export type CppFuncGeneratorFunction<T> = (env: Environment, varSys: VariableSystem, funcParams: CppFuncParams<T>) => string;

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