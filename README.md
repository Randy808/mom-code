# mom-code
## Expressions
The language supports numeric expressions with at most 2 specific operators -- `+` for addition and `*` for multiplication. Subtraction and division are TODOs for the future as of now. The language also supports strings and follows the same type coercions rules that Javascript does.

## Loops
Loops in mom-code have the following syntax: 

`repeat(x){ y }` is the syntax used to repeat an expression y an x number of times.

## Variables
Variables in mom-code have a different syntax than what would be expected of a traditional imperative language.

`save x as y` is the syntax used to save values into variables where x is the expression and y is the identifier.

## In-Built Functions
Right now the only function supported as part of the language is `print(x)`. 

## Sample Code (all code must be entered into the interpreter one line at a time)

### This sample program prints out "hello world" 3 times.

```
save "hello" as hello

save "world" as world

repeat(3){ print(hello + " " + world) }
```

### This sample program adds up all the numbers from 1 to 10 and prints it out.

```
save 0 as sum

repeat(10){ save sum + 1 as sum }

print(sum)
```
