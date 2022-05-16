import { CppFuncParam } from "../variablesystem/CppFuncDefs.js";
import { printIf } from "./WorkUtils.js";

/**
 * All tenary-function below take in two parameter values and returns a string (CppCode) that is the tenary-result of the operation.
 * This return eighter the cpp-code for the operation of one or both parameters are non-static or just the result if they are both static.
 * Also the resulting string assignTrue and assignFalse are supplied using functions because not in all cases are all results required.
 */
//#region Tenary-operations

// Base-tenary-operation function
function tenaryOperation<T>(operator: string, result: (x1: T, x2: T)=>boolean, prmOne: CppFuncParam<T>, prmTwo: CppFuncParam<T>, assignTrue: ()=>string|number, assignFalse: ()=>string|number){
    // If both are static
    if(prmOne.isStatic && prmTwo.isStatic)
        // Returns the resulting value
        return result(prmOne.value as T,prmTwo.value as T) ? assignTrue() : assignFalse();
    else
        // Prints the operation for the code
        return `${prmOne.value} ${operator} ${prmTwo.value} ? (${assignTrue()}) : (${assignFalse()})`;
}

// Larget-tenary-operation (>)
export function tenaryLargerThan(prmOne: CppFuncParam<number>, prmTwo: CppFuncParam<number>, assignTrue: ()=>string, assignFalse: ()=>string){
    return tenaryOperation(">",(a,b)=>a>b,prmOne,prmTwo,assignTrue,assignFalse);
}

// Equals-tenary-operation (==)
export function tenaryBoolsEqual(prmOne: CppFuncParam<boolean>, prmTwo: CppFuncParam<boolean>, assignTrue: ()=>string, assignFalse: ()=>string){
    if(prmOne.isStatic === prmTwo.isStatic){
        if(prmOne.isStatic)
            return prmOne.value === prmTwo.value ? assignTrue() : assignFalse();
        return `${prmOne.value} == ${prmTwo.value} ? (${assignTrue()}) : (${assignFalse()})`;
    }else{
        var val = prmOne.isStatic ? prmOne.value : prmTwo.value;
        var dynVar = prmOne.isStatic ? prmTwo.value : prmOne.value;

        return `${printIf("!",!val)}${dynVar} ? (${assignTrue()}) : (${assignFalse()})`;
    }
}


/**
 * Takes in two numeric parameters and returns their Math.abs-value as eigther the already-calculated value or a string with brackets that can be inserted into a simplifyArrayEquation-function.
 */
export function abs(prmOne: CppFuncParam<number>, prmTwo: CppFuncParam<number>){
    // If both are given (Static)
    if(prmOne.isStatic && prmTwo.isStatic)
        return Math.abs((prmOne.value as number) - (prmTwo.value as number));
    
    // Simplifies the equasion as far as possible and wrappes it around brackets
    return "("+tenaryLargerThan(prmOne, prmTwo,
        ()=>`${prmOne.value} - ${prmTwo.value}`,
        ()=>`${prmTwo.value} - ${prmOne.value}`
    )+")";
}