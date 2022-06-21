import { CalculationError } from "../../errorSystem/Errors.js";
import { Node, NodeTypes } from "../Nodes.js";
import { NumberToken, Token, TokenTypes } from "../Token.js";

export class Parser{
    // Index where the curser currently is at
    private tokenIdx = -1;
    // The token at the cursors position
    private currentToken: Token = null as any as Token;
    
    // List with all tokens to parse
    private tokens: Token[] = null as any as Token[];

    /**
     * Takes in @param tokens from the Lexer and parses them into an abstract syntax tree which will be returned
     * 
     * @throws {CalculationError} if anything went wrong
     */
    public parse(tokens: Token[]) : Node {
        // Preloads everything
        this.tokenIdx = -1;
        this.tokens = tokens;
        this.advance();


        // Parses everything
        var result = this.parseExpr();

        // Ensures the end of file has been reached
        if(this.currentToken.type !== TokenTypes.EOF)
            throw new CalculationError("Syntax-Error. Expected +, -, * or /");
        
        return result;
    }

    // Advances the cursor up to the end
    private advance(){
        this.tokenIdx++;

        if(this.tokenIdx < this.tokens.length)
            this.currentToken = this.tokens[this.tokenIdx];
    }


    // Parses a factor (Number, UnaryNode or maybe even binopnode)
    private parseFactor() : Node{
        // Current token
        var tok = this.currentToken;

        // Checks if an inverter is placed before the next element
        if([TokenTypes.MINUS, TokenTypes.PLUS].includes(tok.type)){
            this.advance();
            // Returns the unary-op node with the type
            return {
                type: NodeTypes.UNARY,
                isNegative: tok.type === TokenTypes.MINUS,
                node: this.parseFactor()
            }
        }

        // Ensures that the current token is a number
        if(tok.type === TokenTypes.NUMBER){
            this.advance();
            return {
                type: NodeTypes.NUMBER,
                value: (tok as NumberToken).value
            }
        }

        if(tok.type === TokenTypes.LPAREN){
            this.advance();
            var exp = this.parseExpr();

            if(this.currentToken.type === TokenTypes.RPAREN){
                this.advance();
                return exp;
            }

            throw new CalculationError("Expected ')'");
        }

        throw new CalculationError("Expected number couldn't be found");

    }

    // Parses a term (*, /)
    private parseTerm(){
        return this.parseBinOp(this.parseFactor.bind(this), [TokenTypes.MUL, TokenTypes.DIV]);
    }

    // Parses an expresion (+, -)
    private parseExpr() : Node{
        return this.parseBinOp(this.parseTerm.bind(this), [TokenTypes.PLUS, TokenTypes.MINUS]);
    }

    /**
     * Used to continously parse more expresions or terms after equal operations
     * @param parseFunction the function to actually parse the next element
     * @param operations the operations that are allowed
     * @returns 
     */
    private parseBinOp(parseFunction: ()=>any, operations: TokenTypes[]) : Node{
        var left: Node = parseFunction();

        // Continues to appends the next elements as long as the next tokens are allowed with the operations
        while(operations.includes(this.currentToken.type)){
            var opTok = this.currentToken;
            this.advance();
            var right = parseFunction();

            left = {
                type: NodeTypes.BINOP,
                leftNode: left,
                opToken: opTok,
                rightNode: right
            }
        }

        // This continues to generate a chain of elements eg. for plus with numbers: 1 + 3 + 4
        // and with every iterations one more element is added eg. 1 + 3 + 4 + 6

        return left;
    }
}