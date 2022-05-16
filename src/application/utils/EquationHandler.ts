import { Variable } from "../variablesystem/Variable";

// Takes in an equation and replaces the variables
export function printEquation(equation: string, vars: {[key: string]: Variable|number}){
    return equation.replace(/\$[a-zA-Z]+/gi, match=>vars[match.substring(1)].toString());
}