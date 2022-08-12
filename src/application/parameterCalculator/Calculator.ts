import { Lexer } from "./interpreter/Lexer.js";
import { Parser } from "./interpreter/Parser.js";
import { Solver } from "./interpreter/Solver.js";

const solver = new Solver();
const parser = new Parser();
const lexer = new Lexer();

/**
 * Performs a calculation based on the given text. Eg. 1 + 3 + 4 and includes the parameter-system
 * @param text the text to parse (Calculate)
 * @returns the calculated number
 * 
 * @throws {CalculationError} if anything is invalid within the text
 */
export function performCalculation(text: string) : number {
    var tokens = lexer.makeTokens(text);

    var ast = parser.parse(tokens);

    return solver.solve(ast);
}