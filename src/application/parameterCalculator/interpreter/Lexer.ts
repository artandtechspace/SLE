import { isValidFirstCharacter, isValidMiddleCharacter, isValidParameterName } from "../ParameterCheck.js";
import { PSModel } from "../system/internal/ParameterSystemController.js";
import { NumberToken, Token, TokenTypes } from "../Token.js";

// Chars the can be ignored
const IGNORE_CHARS = [" ", "\t", "\n"];
// Seperator for decimals in the current language (Default english or .)
const DECIMAL_SEPERATOR = ".";

export class Lexer {
    private text: string = null as any as string;
    private pos: number = -1;
    private currentChar?: string;
    private prevWasNumber: boolean = false;


    /**
     * Takes in a text and converts it to tokens which can then be passed to the parser.
     * 
     * @returns an array of parsed Tokens from the text
     * 
     * @throws {LanguageRef} the error-message if anything went wrong while lexing
     */
     public makeTokens(text: string){
        this.text = text;
        this.prevWasNumber = false;
        this.pos = -1;
        this.advance();


        // Stores the tokens
        var tokens: Token[] = [];
        
        // Iterates over the code until the last char get's reached
        while(this.currentChar !== undefined) {
            if(IGNORE_CHARS.includes(this.currentChar)){
                this.advance();
                continue;
            }

            // Tries to default-chars like plus, minus, etc.
            var optToken = this.getWellKnownTokenType();
            if(optToken !== undefined){
                tokens.push({ type: optToken });
                this.advance();
                continue;
            }

            // Tries to parse number
            if(this.isCharDigit()){
                // Parses the number and appends it
                tokens.push(this.makeNumber());
                continue;
            }

            // Tries to parse a parameter
            if(isValidFirstCharacter(this.currentChar)){
                // Ensures no parameter just got directly appended to a number
                if(this.prevWasNumber)
                    throw {key: "calc.param.error.lexer.nonumbers"};

                // Parses the parameter, looks it up and appends it as a number
                tokens.push(this.makeParameter());
                continue;
            }

            // Illegal character found
            throw {key: "calc.param.error.lexer.illegalcharacter", vars: this.currentChar};
        }

        // Appends final end-of-file token
        tokens.push({ type: TokenTypes.EOF });

        return tokens;
    }

    // Advances the current code-curser by one to the right (Until the end is reached)
    private advance(){
        this.prevWasNumber = this.isCharDigit();
        this.pos++;
        this.currentChar = this.pos < this.text.length ? this.text[this.pos] : undefined;
    }

    /**
     * If this current char is a digit, this method will be called to parse the full number.
     * This function will advance the curser up to the last digit (or decimal-seperator)
     * 
     * @returns the number-token that got parsed
     * 
     * @throws {LanguageRef} the error message if multiple decimal-seperators got found for the single number
     */
    private makeNumber() : NumberToken{
        // The parsed number as a string
        var numStr: string = "";
        // If a floating-point has been found
        var isFloat: boolean = false;

        // Continues the loop while there still are chars that are either digits or the decimal-seperator
        while(this.currentChar !== undefined && (this.isCharDigit() || this.currentChar === DECIMAL_SEPERATOR)){
            // Checks for a decimal seperator
            if(this.currentChar === DECIMAL_SEPERATOR){
                // Checks if there is an error (multiple decimal-seperators)
                if(isFloat)
                    throw {key: "calc.param.error.lexer.multipledecimalpoints"};
                
                // Sets the number to be a float and appends the "programming" decimal-seperator
                isFloat = true;
                numStr+=".";
                this.advance();
                continue;
            }

            // Character is a number, so just append it
            numStr+=this.currentChar;
            this.advance();
        }

        // Returns the number
        return  {
            value: parseFloat(numStr),
            type: TokenTypes.NUMBER
        }
    }

    // Returns if the char at the cursor is a digit
    private isCharDigit(){
        if(this.currentChar === undefined)
            return false;
    
        return this.currentChar >= '0' && this.currentChar <= "9";
    }

    // Returns a tokentype from well-known char's (eg. Plus, minus etc.) but undefined if the current char is not well known
    private getWellKnownTokenType(){
        switch(this.currentChar){
            case "+":
                return TokenTypes.PLUS;
            case "-":
                return TokenTypes.MINUS;
            case "*":
                return TokenTypes.MUL;
            case "/":
                return TokenTypes.DIV;
            case "(":
                return TokenTypes.LPAREN;
            case ")":
                return TokenTypes.RPAREN;
        }

        return undefined;
    }

    /**
     * If this current char is a valid parameter-start character, this method will be called to parse the full parameter,
     * look it up and return a number-token with the current value.
     * This function will advance the curser up to the last parameter-character
     * 
     * @returns the number-token that got parsed
     * 
     * @throws {LanguageRef} the error message if the parameter does not exist
     */
    private makeParameter() : NumberToken{
        // Parameter-name
        var prmName: string = "";
        
        // Iterates as long as a valid var start char or digit is found
        while(this.currentChar !== undefined && isValidMiddleCharacter(this.currentChar)){
            prmName+=this.currentChar;
            this.advance();
        }
        
        // Tries to load the parameter and returns it
        return {
            value: PSModel.getParamValueByName(prmName),
            type: TokenTypes.NUMBER
        }
    }

}