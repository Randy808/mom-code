var SyntaxTreeTypes = require("./syntax-tree-types");
var Lexer = require("./lexer");
var Parser = require("./parser");


const NonTerminals = {
    "PRINT" : "PRINT",
    "FOR": "FOR",
    "F" : "F",
    "M" : "M",
    "A" : "A"
}

const BinaryOperator = {
    MULT: "*",
    DIV: "/",
    PLUS: "+",
    MINUS: "-"
}

var symbolTable = {};


class Interpreter{
    Print(subTree){
         if(subTree.type != SyntaxTreeTypes.Print){
            return;
        }
        console.log(this.Expression(subTree.value));
    }
    
    Expression(subTree){
        if(subTree.type == SyntaxTreeTypes.BinaryExpression){
            return this.BinaryExpression(subTree);
        }
        if(subTree.type == SyntaxTreeTypes.String){
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
        if(subTree.type != SyntaxTreeTypes.FOR){
            return;
        }
        var i = 0;
        
        var upTo = this.Start(subTree.iterationCount);
        //Try all accepatble bodies
        for(var i = 0 ; i < upTo; i++){
            this.Start(subTree.body);
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
        symbolTable[subTree.identifier] = this.Start(subTree.value);
    }

    IdentifierExpression(subTree){
        if(!symbolTable || !symbolTable[subTree.value]){
            throw new Error("Symbol used before it was defined");
        }

        return symbolTable[subTree.value]
    }


    Start(tree){
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
        else if(tree.type == SyntaxTreeTypes.IDENTIFIER){
            return this.IdentifierExpression(tree);
        }
        else if(tree.type == SyntaxTreeTypes.Program ||
            tree.type == SyntaxTreeTypes.Block){
            for(var subTree of tree.body){
                this.Start(subTree);
            }
        }
        else{ //FOR TokenType.NUM
            return tree.value;
        }
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
        if(process.env.debug){
            console.log("\n\n\n INTERPRET")
            console.log(JSON.stringify(tree))
        }
        this.Start(tree);
        
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

function interpretCode(input){
    if(process.env.debug){
        console.log("Input: ",input)
    }
    var lexer = new Lexer(input);
    var tokens = lexer.readTokens();

    var parser = new Parser();
    var treeList = parser.parseTokens(tokens);
    var interpreter = new Interpreter();
    interpreter.interpret(treeList);

    if(process.env.debug){
        console.log(symbolTable);
    }
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

var fs = require('fs').promises;

async function startInterpreter(){
    if(!process.argv[2]){
        evaluateStdin()
        .catch(e => {
            console.log(e)
        })
    }
    else{
        var fh = await fs.open(`./${process.argv[2]}`);
        var a = await fh.readFile({
            encoding: 'utf8'
        });
        console.log(JSON.stringify(a))
        interpretCode(a)
    }
}

startInterpreter();

/*
S -> X + num
X -> num
X -> string

S
X        + num
num
*/