let SyntaxTreeTypes = require("./syntax-tree-types");

let v = {}
let runningVarName = "";
let indentationLevel = 0;
let arrayIteratorNum = 0;


class ThreeCodeGenerator{
	static getInternalVariableName(node){
		let internalVariableName = v[node.identifier];
		if(!internalVariableName){
			runningVarName+="a";
			v[node.identifier] = internalVariableName = runningVarName;
		}

		return internalVariableName;
	}

	static getIteratorVariableName(){
		return `arr${arrayIteratorNum++}`;
	}

	static addIndentation(s){
		for(let i = 0 ; i < indentationLevel ; i++){
			s+="\t";
		}

		return s;
	}
	static gen(node){
		debugger;
		if(node.type == SyntaxTreeTypes.Program){
			for(let child of node.body){
				console.log(`${this.gen(child)}`);
			}
		}
		if(node.type == SyntaxTreeTypes.Block){
			let s = ""
			s = this.addIndentation(s) + "\n"

			indentationLevel++;
			for(let child of node.body){
				s=this.addIndentation(s)
				s+=`${this.gen(child)}\n`;
			}
			indentationLevel--;

			s = this.addIndentation(s)
			s+="}";

			return s;
		}
		if(node.type == SyntaxTreeTypes.Print){
			return `console.log(${this.gen(node.value)})`;
		}
		
		if(node.type == SyntaxTreeTypes.Assignment){
			let useLet = false;
			let internalVariableName = v[node.identifier];
			if(!internalVariableName){
				useLet = true;
				internalVariableName = this.getInternalVariableName(node);
			}
			return `${useLet ? "let " : ""}${internalVariableName} = ${this.gen(node.value)}`;
		}
		if(node.type == SyntaxTreeTypes.IDENTIFIER){
			debugger;
			return v[node.value];
		}
		if(node.type == SyntaxTreeTypes.Number){
			return `${node.value}`;
		}
		if(node.type == SyntaxTreeTypes.String){
			return `"${node.value}"`;
		}
		if(node.type == SyntaxTreeTypes.BinaryExpression){
			let left = this.gen(node.left);
			let right = this.gen(node.right);
			return `${left} ${node.operator} ${right}`;
		}
		if(node.type == SyntaxTreeTypes.FOR){
			let varName = this.getIteratorVariableName();
			return `for(let ${varName} = 0 ; ${varName} < ${this.gen(node.iterationCount)} ; ${varName}++){${this.gen(node.body)}`;
		}
	}
}
var a = {"type":"Program","body":[{"type":"Assignment","identifier":"limit","value":{"type":"NUMBER","value":10}},{"type":"Assignment","identifier":"i","value":{"type":"NUMBER","value":0}},{"type":"For","iterationCount":{"type":"IDENTIFIER","value":"limit"},"body":{"type":"Block","body":[{"type":"Assignment","identifier":"i","value":{"type":"BinaryExpression","operator":"+","left":{"type":"IDENTIFIER","value":"i"},"right":{"type":"NUMBER","value":1}}},{"type":"Assignment","identifier":"j","value":{"type":"NUMBER","value":0}},{"type":"For","iterationCount":{"type":"IDENTIFIER","value":"limit"},"body":{"type":"Program","body":[{"type":"Assignment","identifier":"j","value":{"type":"BinaryExpression","operator":"+","left":{"type":"IDENTIFIER","value":"j"},"right":{"type":"NUMBER","value":1}}},{"type":"print","value":{"type":"BinaryExpression","operator":"+","left":{"type":"IDENTIFIER","value":"i"},"right":{"type":"BinaryExpression","operator":"+","left":{"type":"STRING","value":","},"right":{"type":"IDENTIFIER","value":"j"}}}}]}}]}}]};
var b = {"type":"Program","body":[{"type":"For","iterationCount":{"type":"NUMBER","value":9},"body":{"type":"Block","body":[{"type":"print","value":{"type":"NUMBER","value":2}}]}}]};
var c = {"type":"Program","body":[{"type":"Assignment","identifier":"limit","value":{"type":"NUMBER","value":10}},{"type":"Assignment","identifier":"i","value":{"type":"NUMBER","value":0}},{"type":"For","iterationCount":{"type":"IDENTIFIER","value":"limit"},"body":{"type":"Block","body":[{"type":"Assignment","identifier":"i","value":{"type":"BinaryExpression","operator":"+","left":{"type":"IDENTIFIER","value":"i"},"right":{"type":"NUMBER","value":1}}},{"type":"Assignment","identifier":"j","value":{"type":"NUMBER","value":0}},{"type":"For","iterationCount":{"type":"IDENTIFIER","value":"limit"},"body":{"type":"Block","body":[{"type":"Assignment","identifier":"j","value":{"type":"BinaryExpression","operator":"+","left":{"type":"IDENTIFIER","value":"j"},"right":{"type":"NUMBER","value":1}}},{"type":"print","value":{"type":"BinaryExpression","operator":"+","left":{"type":"IDENTIFIER","value":"i"},"right":{"type":"BinaryExpression","operator":"+","left":{"type":"STRING","value":","},"right":{"type":"IDENTIFIER","value":"j"}}}}]}}]}}]};
//ThreeCodeGenerator.gen({"type":"Program","body":[{"type":"Assignment","identifier":"x","value":{"type":"BinaryExpression","operator":"+","left":{"type":"NUMBER","value":1},"right":{"type":"NUMBER","value":2}}},{"type":"print","value":{"type":"IDENTIFIER","value":"x"}}]})
ThreeCodeGenerator.gen(c)