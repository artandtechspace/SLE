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

function TokenToString(tokenType: TokenTypes){
    switch(tokenType){
        case TokenTypes.DIV:
            return "DIV";
            case TokenTypes.LPAREN:
                return "LPAREN";
            case TokenTypes.MINUS:
                return "MIN";
            case TokenTypes.MUL:
                return "MUL";
            case TokenTypes.PLUS:
                return "PLUS";
            case TokenTypes.RPAREN:
                return "RPAREN";
    }
}

export type NumberToken = {
    value: number;
    type: TokenTypes.NUMBER
};

export type BaseToken = {
    type: TokenTypes
}

export type Token = NumberToken|BaseToken;
