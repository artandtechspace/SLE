import { BaseToken, Token } from "./Token";

export type Node = NumberNode|UnaryOpNode|BinOpNode;

export enum NodeTypes {
    NUMBER,
    BINOP,
    UNARY
}

export type NumberNode = {
    value: number
    type: NodeTypes.NUMBER
}

export type UnaryOpNode = {
    isNegative: boolean,
    node: Node,
    type: NodeTypes.UNARY
}

export type BinOpNode = {
    leftNode: Node,
    opToken: BaseToken,
    rightNode: Node,
    type: NodeTypes.BINOP
}