const TokenType = {
    "AS": "AS",
    "CL_CURLY": "CL_CURLY",
    "CL_PAREN": "CL_PAREN",
    "/": "DIV", //change constants to another object. Make this for tokenizing only
    "DIV": "DIV",
    "EQ" : "EQ",
    "FOR": "FOR",
    "IDENTIFIER" : "IDENTIFIER",
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

module.exports = TokenType;

/*
    "NUMBER": "NUMBER",

"FOR": "FOR",
    "IDENTIFIER" : "IDENTIFIER",
    "SAVE": "SAVE",
    "STRING": "STRING",
    "VAR": "VAR",
        "PRINT": "PRINT", //keyword
*/