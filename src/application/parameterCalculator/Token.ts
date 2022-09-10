export enum TokenTypes {
    PLUS,
    MINUS,
    MUL,
    DIV,
    LPAREN,
    RPAREN,
    EOF,
    NUMBER
}

export type NumberToken = {
    value: number;
    type: TokenTypes.NUMBER
};

export type BaseToken = {
    type: TokenTypes
}

export type Token = NumberToken|BaseToken;
