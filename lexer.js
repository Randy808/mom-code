const TokenType = require('./token-types')

const CharToTokenType = {
    "as": TokenType.AS,
    "}": TokenType.CL_CURLY,
    ")": TokenType.CL_PAREN,
    "/": TokenType.DIV, //change constants to another object. Make this for tokenizing only
    "=" : TokenType.EQ,
    "-": TokenType.MINUS,
    "*": TokenType.MULT,
    "{": TokenType.OP_CURLY,
    "(": TokenType.OP_PAREN,
    "+": TokenType.PLUS
};

const Keywords = {
    "FOR": "repeat",
    "VAR": "var",
    "SAVE": "save",
    "AS": "as"
}

class Token {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
}

class Lexer {
    constructor(inputString) {
        this.currentPosition = 0;
        this.inputString = inputString;
    }

    parseInt() {
        var finalInt = "";
        while (!isNaN(parseInt(this.inputString[this.currentPosition]))) {
            finalInt += this.inputString[this.currentPosition];
            this.currentPosition++
        }

        return finalInt ? new Token(TokenType.NUMBER, parseInt(finalInt)) : false
    }

    parseKeyword(keyword,  tokenType) {
        for (let index = 0; index < keyword.length; index++) {
            if (
                !this.inputString ||
                this.inputString[this.currentPosition + index] != keyword[index]
            ) {
                return false;
            }
        }
        this.currentPosition += keyword.length;
        return new Token(tokenType, keyword);
    }

    parsePrint() {
        var printMatch = this.inputString
            .substr(
                this.currentPosition,
                "print".length 
            ) == "print";

        if (printMatch) {
            this.currentPosition += 5;
            return new Token(TokenType.PRINT);
        }

        return false;
    }

    parseString() {
        if (this.inputString[this.currentPosition] != "\"") {
            return false;
        }

        var finalString = "";
        var addedIndex = 1;
        while (this.currentPosition + addedIndex < this.inputString.length &&
            this.inputString[this.currentPosition + addedIndex] != "\"") {
            finalString += this.inputString[this.currentPosition + addedIndex]
            addedIndex++;
        }
        if (this.currentPosition + addedIndex > this.inputString.length) {
            throw new Error("String never ended.");
        }

        this.currentPosition += (finalString.length + 2)

        return new Token(TokenType.STRING, finalString);

    }

    parseChar(char){
        if (this.inputString[this.currentPosition] == char) {
            this.currentPosition++;
            return new Token(CharToTokenType[char], char);
        }
    }

    isChar(char){
        return char.toUpperCase() != char.toLowerCase();
    }

    parseIdentifier(){
        if(!this.inputString && !this.inputString[this.currentPosition]){
            return;
        }
        var str = "";
        while(this.currentPosition < this.inputString.length && this.isChar(this.inputString[this.currentPosition])){
            str+=this.inputString[this.currentPosition++]
        }

        return str.length && new Token(TokenType.IDENTIFIER, str);
    }

    discardWhitespace(){
        while(this.currentPosition < this.inputString.length 
            && (this.inputString[this.currentPosition] == " " 
                || this.inputString[this.currentPosition] == "\n"
                || this.inputString[this.currentPosition] == "\t")){
           this.currentPosition++;
        }
    }

    error() {
        throw new Error(`Invalid token found at pos ${this.currentPosition}: "${this.inputString[this.currentPosition]}"`)
    }

    parseIntoToken() {
        return this.parseInt() ||
            this.parseKeyword(Keywords.FOR, TokenType.FOR) ||
            this.parseKeyword(Keywords.VAR, TokenType.VAR) ||
            this.parseKeyword(Keywords.SAVE, TokenType.SAVE) ||
            this.parseKeyword(Keywords.AS, TokenType.AS) ||
            this.parseString() ||
            this.parsePrint() ||
            this.parseIdentifier() ||
            this.parseChar("=") ||
            this.parseChar("(") ||
            this.parseChar(")") ||
            this.parseChar("{") ||
            this.parseChar("}") ||
            this.parseChar("+") ||
            this.parseChar("-") ||
            this.parseChar("/") ||
            this.parseChar("*") ||
            this.error()
    }

    readTokens() {
        var tokens = [];
        while (this.currentPosition < this.inputString.length) {
            this.discardWhitespace()
            tokens.push(this.parseIntoToken());
        }

        if(process.env.debug) {
            console.log(JSON.stringify(tokens));
        }
        return tokens;
    }
}

module.exports = Lexer;