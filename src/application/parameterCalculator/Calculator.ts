import { Lexer } from "./interpreter/Lexer";
import { Parser } from "./interpreter/Parser";
import { Solver } from "./interpreter/Solver";

const solver = new Solver();
const parser = new Parser();
const lexer = new Lexer();

/**
 * Performs a calculation based on the given text. Eg. 1 + 3 + 4 and includes the parameter-system
 * @param text the text to parse (Calculate)
 * @returns the calculated number
 * 
 * @throws {LanguageRef} if anything is invalid within the text, throws the error-message
 */
export function performCalculation(text: string) : number {
    var tokens = lexer.makeTokens(text);

    var ast = parser.parse(tokens);

    return solver.solve(ast);
}