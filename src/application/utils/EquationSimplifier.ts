/*
 * This is a VERY simple utility to simplify equations for code generation
 */

import { Variable } from "../variablesystem/VariableSystem";


class Operator{

    public readonly combine: (a: number, b: number)=>number;
    public readonly char: string;
    public readonly base: number;

    constructor(combine: (a: number, b: number)=>number,char: string,base: number){
        this.combine = combine;
        this.char = char;
        this.base = base;
    }
}

// Adds multiple components (+)
const ADD: Operator = new Operator((a,b)=>a+b,"+",0);
// Multiplies multiple components (*)
const MUL: Operator = new Operator((a,b)=>a*b,"*",1);

export interface Equation {
    num?: number,
    vars?: (string|Variable)[],
    equations?: Equation[]
}

/**
 * Takes in a given equation and their base operator and simplifies it.
 * @param eq the equation
 * @param operator the base operator
 * @returns the simplified operation as a string or number
 */
function simplifyEquation(eq: Equation, operator: Operator, isBase: boolean = true): string|number{
    var num = eq.num ?? operator.base;
    var vars = eq.vars ?? [];
    
    // Solves the next equations if there are any
    if(eq.equations)
        for(var tempEq of eq.equations) {
            // Simplifies the equation
            var eqRes: string|number = simplifyEquation(tempEq, operator === ADD ? MUL : ADD,false);

            if(typeof eqRes === "number")
                // Just appends it to the normal number
                num = operator.combine(num,eqRes);
            else
                // Appends to the other variables 
                vars.push(eqRes);
        }

    // Special case (If multiplied with 0, always results in 0)
    if(num === 0 && operator === MUL)
        return 0;

    // If no variables exist
    if(vars.length <= 0)
        return num;

    // If multiplied and just negated
    if(operator === MUL && num === -1){
        if(vars.length === 1)
            return "-"+vars[0];
        
        return "-("+vars.join(` ${operator.char} `)+")";
    }
    
    // Appends the number to the variables if it is not useless (0 for plus or 1 for multiply)
    if(num !== operator.base)
        vars.unshift(num.toString());

    // If only a single variable is given, no brackets are needed
    if(vars.length === 1)
        return vars[0].toString();

    // Combines the other variables
    var combined = vars.join(` ${operator.char} `);

    return operator === MUL || isBase ? combined : `(${combined})`;
}


export const EquationSimplifier = {
    ADD,
    MUL,
    simplifyEquation: (eq: Equation, operator: Operator, isBase: boolean = true) => simplifyEquation(eq,operator,isBase).toString()
}