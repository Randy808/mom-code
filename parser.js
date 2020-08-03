var TokenType = require("./token-types")
var SyntaxTreeTypes = require("./syntax-tree-types");

/*
Grammar

Exp -> identifier | string | F M A
NumOrStr -> string | NUM
M-> * NumOrStr M | / EXP M | epsilon
F -> T
T->NUM A
A-> + Exp A | - Exp A | episilon
ASSIGNMENT-> save EXP as identifier
NUM -> iden | numTerminal
*/

const BinaryOperator = {
    MULT: "*",
    DIV: "/",
    PLUS: "+",
    MINUS: "-"
}

class Parser {
    constructor() {
        this.inputPos = 0;
        this.tokens = null;
    }

    enforceTokensNotNull(){
        if(this.currentPosition >= this.tokens.length){
            throw new Error("Reached end of input during parse");
        }
    }
    eat(token, tokenType) {
        this.enforceTokensNotNull();
        if (token.type == tokenType) {
            this.inputPos++;
            return token;
        } else {
            
            throw new Error("Did not match expected syntax");
        }
    }

    Num(tokens){
        if(tokens[this.inputPos].type == TokenType.IDENTIFIER){
            return this.eat(tokens[this.inputPos], TokenType.IDENTIFIER);
        }
        return this.eat(tokens[this.inputPos], TokenType.NUMBER)
    }

    F(tokens){
        return this.T(tokens)
    }

    T(tokens){
        var left = this.Num(tokens);
        return this.A(left, tokens);
    }

    A(left, tokens){
        var token;
        if(tokens[this.inputPos] && tokens[this.inputPos].type == TokenType.PLUS){
            token = this.eat(tokens[this.inputPos], TokenType.PLUS);
            var right = this.Expression(tokens);
            //var right = this.A(tokens);
            return this.A({
                type: SyntaxTreeTypes.BinaryExpression,
                operator: BinaryOperator.PLUS,
                left: left,
                right: right
            }, tokens);
        }

        if(tokens[this.inputPos] && tokens[this.inputPos].type == TokenType.MINUS){
            token = this.eat(tokens[this.inputPos], TokenType.MINUS);
            var right = this.Expression(tokens);
             return this.A({
                type: SyntaxTreeTypes.BinaryExpression,
                operator: BinaryOperator.MINUS,
                left: left,
                right: right
            }, tokens);
        }

        return left;
    }

    Str(tokens){
        return this.eat(tokens[this.inputPos], TokenType.STRING);
    }

    NumOrStr(tokens){
        if(tokens[this.inputPos] && tokens[this.inputPos].type == TokenType.NUMBER){
            return this.Num(tokens);
        }
        else if(tokens[this.inputPos] && tokens[this.inputPos].type == TokenType.STRING){
            return this.Str(tokens);
        }
        else{
            throw new Error("Expected number or string");
        }
    }

    M(left, tokens){
        var token;
        if(tokens[this.inputPos] && tokens[this.inputPos].type == TokenType.MULT){
            token = this.eat(tokens[this.inputPos], TokenType.MULT);
            var right = this.NumOrStr(tokens);
            return this.M({
                type: SyntaxTreeTypes.BinaryExpression,
                operator: BinaryOperator.MULT,
                left: left,
                right: right
            }, tokens);
        }

        if(tokens[this.inputPos] && tokens[this.inputPos].type == TokenType.DIV){
            token = this.eat(tokens[this.inputPos], TokenType.DIV);
            var right = this.Num(tokens);
            return this.M({
                type: SyntaxTreeTypes.BinaryExpression,
                operator: BinaryOperator.DIV,
                left: left,
                right: right
            }, tokens);
        }

        return left;
    }

    Expression(tokens){
        var token;
        var left;
        if(tokens[this.inputPos].type == TokenType.STRING){
            left = this.Str(tokens);
        }
        else{
            left = this.F(tokens);
        }

        var node = this.M(left, tokens);
        if(process.env.debug){
            console.log(`\nThis is the 
                right returned from expression` 
                + JSON.stringify(node));
        }

        var node2 = this.A(node, tokens);

        if(process.env.debug){
            console.log(`\nThis is the 
                right returned from expression` 
                + JSON.stringify(node));
        }

        return node2;
    }

    Print(tokens) {
        this.eat(tokens[this.inputPos], TokenType.PRINT);
        this.eat(tokens[this.inputPos], TokenType.OP_PAREN);
        var value = this.Expression(tokens);
        if(process.env.debug){
            console.log(`\n\nThis is the value of the expression inside print: ${JSON.stringify(value)}`);
        }
        this.eat(tokens[this.inputPos], TokenType.CL_PAREN);

        return {
            type: SyntaxTreeTypes.Print,
            value: value
        }
    }

    ForLoop(tokens) {
        this.eat(tokens[this.inputPos], TokenType.FOR);
        this.eat(tokens[this.inputPos], TokenType.OP_PAREN);
        var iterationCount = this.Expression(tokens);
        this.eat(tokens[this.inputPos], TokenType.CL_PAREN);
        this.eat(tokens[this.inputPos], TokenType.OP_CURLY);

        var body = []
        while(tokens[this.inputPos].type != TokenType.CL_CURLY){
             body.push(this.Start(tokens));
        }
        this.eat(tokens[this.inputPos], TokenType.CL_CURLY);

        return {
            type: SyntaxTreeTypes.FOR,
            iterationCount: iterationCount,
            body: {
                type: SyntaxTreeTypes.Block,
                body: body
            }
        }
    }

    Assignment(tokens){
        this.eat(tokens[this.inputPos], TokenType.SAVE);
        var val = this.Expression(tokens)
        this.eat(tokens[this.inputPos], TokenType.AS);
        var id = this.eat(tokens[this.inputPos], TokenType.IDENTIFIER);
        

        return {
            type: SyntaxTreeTypes.Assignment,
            identifier: id.value,
            value: val
        }
    }

    Start(tokens){
        var AST;

        if(tokens[this.inputPos].type == TokenType.FOR){
            AST = this.ForLoop(tokens);
        }
        else if(tokens[this.inputPos].type == TokenType.PRINT){
            AST = this.Print(tokens);
        }
        else if(tokens[this.inputPos].type == TokenType.SAVE){
            AST = this.Assignment(tokens);
        }
        else{
            AST = this.Expression(tokens);
        }

        return AST;
    }
    parseTokens(tokens) {
        this.tokens = tokens;
        var treeList = [];

        while(this.inputPos < tokens.length){
            treeList.push(this.Start(tokens));
        }

        if(process.env.debug){
            console.log("\n\n")
            console.log(JSON.stringify(treeList));
        }
        return {
            type: SyntaxTreeTypes.Program,
            body: treeList
        };
    }
}

module.exports = Parser;