import { CalculationError } from "../../errorSystem/Errors.js";
import { Node, NodeTypes } from "../Nodes.js";
import { BaseToken, TokenTypes } from "../Token.js";

export class Solver{

    /**
     * Takes in a @param node and calculates the result
     * @returns a single number as the result
     */
     public solve(node: Node) : number{
        switch(node.type){
            case NodeTypes.BINOP:
                 // Resolved the left and right first
                var left = this.solve(node.leftNode);
                var right = this.solve(node.rightNode);

                return this.performOperation(left, node.opToken, right);
            case NodeTypes.UNARY:
                return this.solve(node.node) * (node.isNegative ? -1 : 1);
            case NodeTypes.NUMBER:
                return node.value; 
        }
    }

    /**
     * Takes in a left number, a token (Operations) and a right number.
     * @returns then returns the result of the operations as a number
     */
    private performOperation(left: number, token: BaseToken, right: number){
        switch(token.type){
            case TokenTypes.PLUS:
                return left + right;
            case TokenTypes.MINUS:
                return left - right;
            case TokenTypes.MUL:
                return left * right;
            case TokenTypes.DIV:
                return left / right;
            default:
                throw new CalculationError("Critical error occurred, this should not have happend.");
        }
    }
}