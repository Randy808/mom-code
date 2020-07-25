const TokenType = {
    "AS": "AS",
    "CL_CURLY": "CL_CURLY",
    "CL_PAREN": "CL_PAREN",
    "/": "DIV", //change constants to another object. Make this for tokenizing only
    "DIV": "DIV",
    "EQ" : "EQ",
    "FOR": "FOR",
    "IDENTIFIER" : "IDENTIFIER",
    "LITERAL": "LITERAL",
    "-": "MINUS",
    MINUS: "MINUS",
    "MULT": "MULT",
    "NUMBER": "NUMBER",
    "OPERATOR": "OPERATOR",
    "OP_CURLY": "OP_CURLY",
    "OP_PAREN": "OP_PAREN",
    "PRINT": "PRINT", //keyword
    "PLUS": "PLUS",
    "SAVE": "SAVE",
    "STRING": "STRING",
    "VAR": "VAR",
};

const NonTerminals = {
    "PRINT" : "PRINT",
    "FOR": "FOR",
    "F" : "F",
    "M" : "M",
    "A" : "A"
}

const Keywords = {
    "FOR": "repeat",
    "VAR": "var",
    "SAVE": "save",
    "AS": "as"
}

const SyntaxTreeTypes = {
    "Assignment": "Assignment",
    "FOR": "For",
    BinaryExpression: "BinaryExpression",
    Print: "print",
    String: "STRING",
    "IDENTIFIER": "IDENTIFIER"
}

const BinaryOperator = {
    MULT: "*",
    DIV: "/",
    PLUS: "+",
    MINUS: "-"
}

var symbolTable = {};

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

    parseOpParen() {
        if (this.inputString[this.currentPosition] == "(") {
            this.currentPosition++;
            return new Token(TokenType.OP_PAREN, "(");
        }
    }

    parseEq() {
        if (this.inputString[this.currentPosition] == "=") {
            this.currentPosition++;
            return new Token(TokenType.EQ, "=");
        }
    }

    parseClParen() {
        if (this.inputString[this.currentPosition] == ")") {
            this.currentPosition++;
            return new Token(TokenType.CL_PAREN, ")");
        }
    }


    parseOpCurly() {
        if (this.inputString[this.currentPosition] == "{") {
            this.currentPosition++;
            return new Token(TokenType.OP_CURLY, "{");
        }
    }

    parseClCurly() {
        if (this.inputString[this.currentPosition] == "}") {
            this.currentPosition++;
            return new Token(TokenType.CL_CURLY, "}");
        }
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

    parsePlus() {
        if (this.inputString[this.currentPosition] == "+") {
            this.currentPosition++;
            return new Token(TokenType.PLUS, "+");
        }
    }

    parseMult() {
        if (this.inputString[this.currentPosition] == "*") {
            this.currentPosition++;
            return new Token(TokenType.MULT, "*");
        }
    }

    parseChar(char){
        if (this.inputString[this.currentPosition] == char) {
            this.currentPosition++;
            return new Token(TokenType[char], char);
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
        while(this.currentPosition < this.inputString.length && this.inputString[this.currentPosition] == " "){
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
            this.parseEq() ||
            this.parseOpParen() ||
            this.parseClParen() ||
            this.parseOpCurly() ||
            this.parseClCurly() ||
            this.parseString() ||
            this.parsePrint() ||
            this.parsePlus() ||
            this.parseChar("-") ||
            this.parseChar("/") ||
            this.parseMult() ||
            this.parseIdentifier() ||
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
/*
Exp -> identifier
Exp-> string
Exp->F M A
M->
M-> * EXP M
M-> / EXP M
F -> T
T->NUM A
A-> + Exp A
A-> - Exp A
A->episilon
ASSIGNMENT-> save EXP as identifier
NUM -> iden
NUM-> numTerminal

TERMINALS
identifier
var
for
print
EQUALS


*/


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
        if (token && token.type == tokenType) {
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
    M(left, tokens){

        //TODO: Don't make this right associative
        var token;
        if(tokens[this.inputPos] && tokens[this.inputPos].type == TokenType.MULT){
            token = this.eat(tokens[this.inputPos], TokenType.MULT);
            var right = this.Expression(tokens);
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
            left =  this.eat(tokens[this.inputPos], TokenType.STRING);
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

        var body;
        if(tokens[this.inputPos] &&
            tokens[this.inputPos].type == TokenType.PRINT){
            body = this.Print(tokens);
        }
        else if(tokens[this.inputPos] &&
            tokens[this.inputPos].type == TokenType.SAVE){
            body = this.Assignment(tokens);
        }
        else{
            this.Expression(tokens);
        }
        this.eat(tokens[this.inputPos], TokenType.CL_CURLY);

        return {
            type: SyntaxTreeTypes.FOR,
            iterationCount: iterationCount,
            body: body
        }
    }

    Assignment(tokens){
        debugger;
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
    parseTokens(tokens) {
        this.tokens = tokens;
        var AST;
        if(tokens[0].type == TokenType.FOR){
            AST = this.ForLoop(tokens);
        }
        else if(tokens[0].type == TokenType.PRINT){
            AST = this.Print(tokens);
        }
        else if(tokens[0].type == TokenType.SAVE){
            AST = this.Assignment(tokens);
        }
        else{
            AST = this.Expression(tokens);
        }

        if(process.env.debug){
            console.log("\n\n")
            console.log(JSON.stringify(AST));
        }
        return AST;
    }
}

//TEST
//for(9){print("d")}

class Interpreter{
    Print(subTree){
         if(subTree.type != SyntaxTreeTypes.Print){
            return;
        }
        
        console.log(this.Expression(subTree.value));
    }
    
    Expression(subTree){
        debugger;
        if(subTree.type == SyntaxTreeTypes.BinaryExpression){
            return this.BinaryExpression(subTree);
        }
        if(subTree.type == TokenType.STRING){
            return subTree.value;
        }
        if(subTree.type == SyntaxTreeTypes.IDENTIFIER){
            if(symbolTable[subTree.value] == null ||
                symbolTable[subTree.value] == undefined){
                throw new Error("Symbol used before it was defined")
            }
            if(process.env.debug){
                console.log("Symbols used.")
            }
            //TODO: Only return value during evaluation, 
                //otherwise just return symbol table reference
            return symbolTable[subTree.value];
        }
        else{
            return subTree.value;
        }
    }

    ForLoop(subTree){
        debugger;
        if(subTree.type != SyntaxTreeTypes.FOR){
            return;
        }
        var i = 0;
        
        var upTo = this.interpret(subTree.iterationCount);
        //Try all accepatble bodies
        for(var i = 0 ; i < upTo; i++){
            this.interpret(subTree.body);
        }
    }

    BinaryExpression(subTree){
        if(subTree.type != SyntaxTreeTypes.BinaryExpression){
            return;
        }

        var left = this.Expression(subTree.left);
        var right = this.Expression(subTree.right);

        if(subTree.operator == BinaryOperator.PLUS){
            return left + right;
        }
        else if(subTree.operator == BinaryOperator.MINUS){
            return left - right;
        }
        else if(subTree.operator == BinaryOperator.DIV){
            return left / right;
        }
        else{
            var stringOp = this.HandleMultBetweenNumAndString(left, right);

            if(stringOp){
                return stringOp;
            }
            return left * right;
        }
    }

    HandleMultBetweenNumAndString(left, right){
        var string;
        var num;
        if(typeof left == "string" &&
                typeof right == "number" ){
            string = left;
            num = right;
        }
        else if(typeof right == "string" &&
                    typeof left == "number" ){
            string = right;
            num = left;
        }

        let s = "";
        for(let i = 0 ; i < num ; i++){
            s+=string;
        }
        return s;
    }

    Assignment(subTree){
        symbolTable[subTree.identifier] = this.interpret(subTree.value);
    }

    IdentifierExpression(subTree){
        if(!symbolTable || !symbolTable[subTree.value]){
            throw new Error("Symbol used before it was defined");
        }

        return symbolTable[subTree.value]
    }

    interpret(tree){
        //TODO: Shouldn't filter on BinaryExpression; Should filter on Expression.
        //BinaryExpression is subset of Expression.
        //TODO: Remove else case. 
            //Right now it handles TokenType.NUM.
            //TokenType.NUM should get handled by Expression as well
            //In fact, the type filtering should be done inside the methods.
                //The interpretation should stop after one of the methods returns something.
                //Like in Parsing above
        if(tree.type == SyntaxTreeTypes.FOR){
            return this.ForLoop(tree)
        }
        else if(tree.type == SyntaxTreeTypes.BinaryExpression){
            return this.BinaryExpression(tree);
        }
        else if(tree.type == SyntaxTreeTypes.Print){
            return this.Print(tree);
        }
        else if(tree.type == SyntaxTreeTypes.Assignment){
            return this.Assignment(tree);
        }
        else if(tree.type == TokenType.IDENTIFIER){
            return this.IdentifierExpression(tree);
        }
        else{ //FOR TokenType.NUM
            return tree.value;
        }
    }
}

const readline = require('readline');


function readInput() {
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve, reject) => rl.question('>', (answer) => {
        rl.close();
        resolve(answer);
    }));
}


async function evaluateStdin() {
    var input;
    while (true) {
        input = await readInput();
        if(process.env.debug){
            console.log(`Evaluating ${input}...`)
        }
        try{
            interpretCode(input)
        }
        catch(e){
            console.log(e);
        }
    }
}

evaluateStdin()
    .catch(e => {
        console.log(e)
    })

function interpretCode(input){
    if(process.env.debug){
        console.log("Input: ",input)
    }
    var lexer = new Lexer(input);
    var tokens = lexer.readTokens();

    var parser = new Parser();
    var AST = parser.parseTokens(tokens);
    debugger;
    var interpreter = new Interpreter();
    interpreter.interpret(AST);

    if(process.env.debug){
        console.log(symbolTable);
    }
}
