import { Lexer } from "./systems/Lexer.js";
import { Parser } from "./systems/Parser.js";
import { Solver } from "./systems/Solver.js";

const solver = new Solver();
const parser = new Parser();
const lexer = new Lexer();

export function debugCalculation(text: string) : number {
    var tokens = lexer.makeTokens(text);

    var ast = parser.parse(tokens);

    return solver.solve(ast);
}