import { ResourceType, TaskDifficulty, TaskPriority, TaskType } from "@prisma/client";

export interface SeedTask {
  code: string;
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  difficulty: TaskDifficulty;
  points: number;
  estimatedHours: number;
  instructions: string;
  acceptanceCriteria: string[];
  isWeeklyProject?: boolean;
}

export interface SeedTopic {
  title: string;
  content: string;
}

export interface SeedResource {
  title: string;
  description: string;
  url: string;
  type: ResourceType;
  isRequired: boolean;
  estimatedMinutes: number;
  topic?: string;
}

export interface SeedWeek {
  weekNumber: number;
  title: string;
  description: string;
  objectives: string[];
  topics: SeedTopic[];
  resources: SeedResource[];
  tasks: SeedTask[];
  researchQuestions: string[];
  weeklyProjectTitle?: string;
  weeklyProjectDescription?: string;
  submissionRequirements: string[];
}

export interface SeedPhase {
  phaseNumber: number;
  title: string;
  description: string;
  weeks: SeedWeek[];
}

const DOC = ResourceType.DOCUMENTATION;

// Each phase is exactly 4 weeks (one "training month"), so the whole
// program runs exactly 12 weeks / 3 months. The real cohort curriculum this
// is based on ran the same content over more (non-contiguous) calendar
// weeks — here, weeks that were lighter on new material are folded into
// the same week as an adjacent one so nothing from the source material is
// dropped, just regrouped onto a clean 1–12 week numbering.
export const phasesData: SeedPhase[] = [
  // ─────────────────────────────────────────────────────────────────────
  // Phase 1 — Frontend Fundamentals (Weeks 1–4)
  // ─────────────────────────────────────────────────────────────────────
  {
    phaseNumber: 1,
    title: "Frontend Fundamentals",
    description:
      "Core JavaScript, the command line and Git, then HTML/CSS and the DOM — building up to two solo projects.",
    weeks: [
      {
        weekNumber: 1,
        title: "JavaScript Fundamentals",
        description:
          "Programming fundamentals, JavaScript basics, the command line and Git, then scope, arrays and objects.",
        objectives: [
          "Write and run basic JavaScript programs",
          "Navigate and operate confidently from the command line",
          "Initialize a Git repository, commit and push to GitHub",
          "Define and call functions, and write conditional logic",
          "Understand function/block scope at a basic level",
          "Manipulate arrays and model data with objects",
        ],
        topics: [
          {
            title: "Introduction To JS",
            content: `## High-Level Goals

By the end of this lesson, you will be familiar with the following:

- The definition of JavaScript
- Knowing the basic JavaScript value types
- Using the console to create JavaScript expressions

## JavaScript

### What Is JavaScript

JavaScript is mainly a client-side scripting language used to implement dynamic features for the web. It can run in most browsers — Chrome, Firefox, Edge, Safari — and also on servers via Node.js. In Chrome you can open the console by right-clicking the page and choosing "Inspect", or with the shortcut Ctrl+Shift+J on Windows (Option+Command+J on macOS).

### What Is Syntax

The syntax of a language is the set of rules that define which combinations of symbols count as correctly structured statements or expressions in that language.

Try the following in the console:

~~~js
1 + 1;
"a";
1 * 4;
8 / 2;
~~~

## Basic Value Types

~~~js
// 1. Strings — a series of characters
"This is an example of a string", 'another example';

// combine strings with the + operator (string concatenation)
"Hello " + "World"; // "Hello World"

// 2. Numbers
100, 3.14, -50, 0.01;

// arithmetic follows the normal order of operations (PEMDAS)
200 + (10 * 3) / 2 - 5; // 210
10 % 2; // 0 (the remainder operator)
~~~

## Mixing Types

JavaScript isn't strictly typed, so it's possible to mix values of different types in one expression.

~~~js
"I am " + 20 + " years old"; // "I am 20 years old"
10 + 3.14; // 13.14

"10" + 1; // "101" (string concatenation wins)
"10" - 1; // 9    (arithmetic operators try to convert to numbers)
"10" / 2; // 5
"10" % 3; // 1
~~~

Mixing types makes the language a little more forgiving for beginners, but it can also cause unexpected behavior if you're not paying attention to types.

## Variables

Variables are containers used for storing values. There are three keywords used to declare a variable: \`var\`, \`let\` and \`const\`.

### Defining A Variable And Assignment

~~~js
// const cannot be reassigned; let can
const variableName = "variable value";
let anotherVariable = 15;

anotherVariable = 16; // fine, let allows reassignment
// variableName = "new value"; // TypeError: Assignment to constant variable.

// to read a variable's value, just use its name
anotherVariable; // 16

let a = 10;
let b = a; // b gets a COPY of a's current value
a = 30;
a; // 30
b; // 10 (unaffected)

// a variable with no assigned value is undefined
let notYetAssigned;
notYetAssigned; // undefined
~~~

## Naming Variables

- The name must begin with a letter, \`$\` or \`_\`.
- You can't name a variable after a reserved keyword (\`let\`, \`const\`, \`function\`, ...).
- The name can contain letters, \`$\`, \`_\`, and digits (but can't start with a digit).
- Names are case-sensitive.
- Convention: use camelCase.
- Use descriptive names so the variable's purpose is clear just from reading it.

~~~js
// valid
let userName;
let $price;
let _privateValue;

// invalid
// let 1stPlace;   // can't start with a digit
// let user-name;  // hyphens aren't allowed
// let const;      // reserved keyword
~~~

## Writing A Program

Computers follow instructions exactly and in order — unlike humans, they can't make intuitive leaps about what you "probably meant". Code is read from top to bottom, left to right. Use \`//\` to add a comment explaining code — comments are ignored when the program runs.

~~~js
// A tiny program
console.log("Hello");
console.log(1 + 1);
~~~

## Practice

1. Predict the value of the following expressions, then try them in the console:

~~~js
4 + 3 * (2 - 1);
9 % 4;
(9 / 2) * (10 % 3);
30 / 5 + 40 - (10 % 2);
~~~

2. Figure out the syntax errors in the following variable declarations, and fix them:

~~~js
const @name = "Julia";
const 1age = 30;
const *lastName = "Smith";
const variable-1 = "value";
~~~

3. Define the following variables:
   - A variable \`color\` containing your favorite color.
   - A variable \`positiveNumber\` containing any positive number.
   - A variable \`bool\` containing your favorite boolean value.
   - A variable \`phoneNumber\` containing a phone number.
4. Before running the following expressions, try to predict their outcome:

~~~js
10 + "10";
"10" + "10";
10 + 10 + "10";
"10" + 10 + 10;
"5" * "5";
"5" - "2";
5 + "5" - 2;
~~~

5. Using string concatenation, write an expression that combines your first name, last name, and nationality into one sentence.
6. Write an expression that represents the number of seconds in 30 days.
7. Reassign the value of \`x\` so the expression below evaluates to \`9\`:

~~~js
let x = 1;
const n = 5;
x + 8 * n;
~~~

8. Using the variables below, write an expression that calculates the total price for two coffees, including tip and tax:

~~~js
const tip = 0.15; // 15%
const taxRate = 0.05; // 5%
const coffeePrice = 4;
~~~

9. Write an expression that computes the average grade of a class, knowing 5 students got 74, 2 students got 85, and the remaining 3 got 90.
10. Write expressions that compute the area and perimeter of a rectangle with a length of 90m and a width of 5m.
11. Write expressions that compute the diameter and circumference of a circle with a radius of 5m.
12. Write an expression that converts 50 degrees Celsius to Fahrenheit.`,
          },
          {
            title: "Command Line & GIT",
            content: `## High-Level Goals

By the end of this lesson, you will be familiar with the following:

- Command Line
- GitHub
- Git

## Command Line

### What Is The Command Line

The command line is a text interface for computers — it runs commands that perform actions such as creating, editing and deleting files, running scripts, navigating through folders, etc. On Windows the default command line is called Command Prompt (\`cmd\`), and on macOS it's called Terminal. We'll install and use Git Bash instead, since it behaves the same way across operating systems.

Open Git Bash and type a command, then hit enter — here are some of the things you can do.

### Print Work Directory

Prints the current directory the terminal is in:

~~~bash
pwd
~~~

### List

Lists files and directories in the current location:

~~~bash
ls
~~~

### Change Directory

Changes the working directory to the given path (usually relative to the current directory):

~~~bash
cd week4/lesson4
~~~

Go back up to the parent directory:

~~~bash
cd ..
~~~

### Creating Files And Folders

\`mkdir\` creates a folder; \`touch\` creates a file if it doesn't already exist:

~~~bash
mkdir test
touch index.html
~~~

## Git & GitHub

### GitHub

GitHub hosts version-controlled software projects. It keeps the full history of every version, makes it easy to revert to an older version, tracks changes across versions, and gives teams tools to work together. It's also an important platform for showcasing your work to potential employers.

Repositories can be public (viewable/accessible by anyone) or private (invite-only).

**Creating a repository:**

1. Go to GitHub.
2. Log in if you aren't already.
3. Click the "Repositories" tab.
4. Click "New".
5. Fill in the repository information.
6. Click "Create repository".

### What Is Git

Git is an open-source distributed version control system — it versions your code, lets you upload it to services like GitHub, and share it easily with others. Git is mainly used through the command line. Check that it's installed with:

~~~bash
git --version
~~~

### Setup

Before working with Git, connect your identity — replace the email and username below with your own:

~~~bash
git config --global user.email "email@domain.com"
git config --global user.name "user_name"
~~~

### Cloning

Cloning gets a copy of a remote repository onto your machine:

~~~bash
git clone https://github.com/User-Name/Repository-Name.git
~~~

### Checking Changes

After making changes, check which files were modified:

~~~bash
git status
~~~

### Staging Changes

\`git add\` stages changes so they'll be included in the next commit:

~~~bash
git add file-1
git add file-1 file-2 file-3   # multiple files at once
git add .                       # every modified file
~~~

### Committing Changes

A commit is a snapshot of the repository with a message describing what changed — keep messages meaningful and concise:

~~~bash
git commit -m "Describe the changes"
~~~

### Pushing Changes

Pushing uploads your local commits to the remote repository. \`origin\` is the default remote name, and \`main\` is the default branch name:

~~~bash
git push origin main
~~~

### Git Workflow

- \`git clone\` the repo if it doesn't exist locally yet.
- Make changes, then \`git add\` them to the staging area (\`git status\` first to check what changed, if needed).
- \`git commit -m "commit message"\` to snapshot the staged changes.
- \`git push origin main\` to upload your commits.
- Repeat from step 2 as you keep working.

## Practice

1. Install Git and Git Bash, then run \`git --version\` to confirm it installed correctly.
2. Using only the command line, create a new folder called \`practice-repo\`, move into it, and create three files inside it: \`index.html\`, \`style.css\`, and \`script.js\`.
3. Set your global Git \`user.name\` and \`user.email\`.
4. Create a new empty repository on GitHub, then initialize Git in your \`practice-repo\` folder and connect it to the GitHub repository.
5. Stage and commit your three files with a meaningful commit message, then push them to GitHub.
6. Make a small change to \`index.html\`, then repeat the add/commit/push cycle with a new, different commit message.
7. Run \`git status\` before and after staging a change, and explain in your own words what changed between the two outputs.`,
          },
          {
            title: "Functions",
            content: `## High-Level Goals

By the end of this lesson, you will be familiar with the following:

- The definition of functions
- Creating a function and invoking it
- Understanding parameters and arguments
- Using the \`return\` keyword

## Functions

### What Are Functions

A function is a reusable segment of code dedicated to performing a specific action, that can be invoked from other code at any point. Functions can be created either as a function declaration or as a function expression.

Parameters and variables declared inside a function are local to it — they're inaccessible from outside the function unless returned with the \`return\` keyword.

### Define A Function

~~~js
// function expression
const sumNumbers = function () {
  console.log("summing numbers");
};

// function declaration
function sumNumbers() {
  console.log("summing numbers");
}

// call/invoke it with parentheses
sumNumbers(); // "summing numbers"
~~~

### Parameters And Arguments

Parameters let a function accept values from the outside, making it reusable for different inputs.

~~~js
// num1 and num2 are parameters
function sumNumbers(num1, num2) {
  console.log(num1 + num2);
}

// 2 and 3 are the arguments passed in when calling the function
sumNumbers(2, 3); // 5

// default parameters
function greet(name = "stranger") {
  console.log("Hello " + name);
}
greet(); // "Hello stranger"
~~~

### Functions As Values

So far our functions only \`console.log\` their result — but often we need to use that result elsewhere in the code. That's what \`return\` is for.

~~~js
function add(firstNumber, secondNumber) {
  return firstNumber + secondNumber;
}

function subtract(firstNumber, secondNumber) {
  return firstNumber - secondNumber;
}

add(10, 5); // 15 (the returned value)

// store the returned value in a variable to use it later
const total = add(10, 5); // total is 15
~~~

A function without an explicit \`return\` returns \`undefined\`.

### Built-In Functions

JavaScript ships with a lot of built-in functionality:

~~~js
console.log("Hello"); // prints to the console

Math.round(4.6); // 5 — rounds to the nearest whole number
Math.max(3, 7, 2); // 7 — the largest of the arguments
Math.min(3, 7, 2); // 2 — the smallest of the arguments
Math.pow(2, 3); // 8  — 2 to the power of 3
~~~

## Pulse Check

1. Find and fix the syntax errors in a few broken function definitions your instructor shows you.
2. Write a function \`sayHello\` that returns \`"hello"\` when called.
3. Write a function \`increment\` that accepts one argument, \`number\`, and returns that number increased by one.
4. Write a function \`isPositive\` that accepts one argument, \`number\`, and returns \`"positive"\`, \`"negative"\` or \`"zero"\` depending on its value.

## Practice

1. Write a function \`double\` that accepts one argument, \`number\`, and returns it doubled.
2. Write a function \`fullName\` that accepts two arguments, \`firstName\` and \`lastName\`, and returns them combined into one string.
3. Write a function \`average\` that accepts two numbers and returns their average.
4. Write a function \`isEven\` that accepts one argument, \`number\`, and returns \`true\` if it's even and \`false\` if it's odd.
5. Write a function \`absoluteValue\` that accepts one argument, \`number\`, and returns its absolute value (without using \`Math.abs\`).
6. Write a function \`total\` that accepts three numbers — \`price\`, \`taxRate\` and \`tipRate\` — and returns the final total after adding tax and tip.
7. Write a function \`sumOfSquares\` that accepts two numbers and returns the sum of their squares. (Hint: look up \`Math.pow\`.)
8. Write a function \`isOlder\` that accepts two ages and returns whichever one is older.

## Advanced Practice

1. Write a function \`randomNumber\` that returns a random decimal between 0 (inclusive) and 1 (exclusive). (Hint: search MDN for the right \`Math\` method.)
2. Write a function \`coinFlip\` that returns either \`"heads"\` or \`"tails"\`, chosen at random.
3. Write a function \`randomInRange\` that accepts a \`min\` and \`max\` number and returns a random integer between them (inclusive).
4. Write a function \`randomAgeGroup\` that accepts an array of names and returns one of them at random.`,
          },
          {
            title: "Conditionals",
            content: `## High-Level Goals

By the end of this lesson, you will be familiar with the following:

- Booleans
- Comparison operators
- Logical operators
- Conditional statements
- Truthy and falsy values

## Conditionals

### Booleans

A boolean is a data type with only one of two possible values: \`true\` or \`false\`. Booleans are usually produced by comparison operators.

### Comparison Operators

Comparison operators compare two values and produce a boolean result.

~~~js
1 > 2; // false
2 > 1; // true
1 >= 1; // true
2 < 1; // false
1 <= 1; // true

// == compares value only (with type coercion)
1 == "1"; // true
// === compares value AND type ("strict equality" — prefer this one)
1 === "1"; // false
1 === 1; // true

1 != 2; // true
1 !== "1"; // true
~~~

### Logical Operators

Logical operators combine multiple boolean expressions.

~~~js
// && (AND) — true only if both sides are true
true && true; // true
true && false; // false

// || (OR) — true if at least one side is true
true || false; // true
false || false; // false

// ! (NOT) — flips the boolean
!true; // false
!false; // true
~~~

### Conditional Statements

An \`if\` statement runs a block of code only when its condition is truthy.

~~~js
if (condition) {
  // runs if condition is truthy
} else if (anotherCondition) {
  // runs if anotherCondition is truthy
} else {
  // runs if none of the above were truthy
}
~~~

~~~js
const age = 20;
if (age >= 18) {
  console.log("You are an adult");
} else {
  console.log("You are a minor");
}
~~~

### Truthy And Falsy Values

JavaScript automatically converts any value to a boolean when it's used in a condition. Values that convert to \`false\` are "falsy"; everything else is "truthy".

~~~js
// falsy values — there are only these:
false, 0, "", null, undefined, NaN;

// truthy — basically everything else, including:
true, 1, "hello", [], {};
~~~

### Ternary Operator

A shorter way to write a simple if/else that returns a value:

~~~js
const age = 20;
const message = age >= 18 ? "You are an adult" : "You are a minor";
~~~

## Pulse Check

1. Predict the boolean result of a few comparison expressions your instructor writes on the board, then verify in the console.
2. Write an \`if/else\` statement that logs \`"even"\` or \`"odd"\` depending on a given number.
3. Rewrite that same \`if/else\` as a ternary expression.

## Practice

1. Write a function \`canVote\` that accepts an \`age\` and returns \`true\` if the person is 18 or older, \`false\` otherwise.
2. Write a function \`getGrade\` that accepts a numeric \`score\` and returns the letter grade: \`"A"\` (90+), \`"B"\` (80-89), \`"C"\` (70-79), \`"D"\` (60-69), or \`"F"\` (below 60).
3. Write a function \`isLeapYear\` that accepts a \`year\` and returns \`true\` if it's a leap year (divisible by 4, but not by 100 unless also divisible by 400).
4. Write a function \`classify\` that accepts a number and returns \`"positive"\`, \`"negative"\`, or \`"zero"\`.
5. Write a function \`canEnterClub\` that accepts \`age\` and \`hasID\`, and returns \`true\` only if the person is 18+ AND has an ID.
6. Write a function \`discountPrice\` that accepts a \`price\` and a \`isMember\` boolean, and returns the price with a 10% discount applied if they're a member.
7. Write a function \`triangleType\` that accepts three side lengths and returns \`"equilateral"\`, \`"isosceles"\`, or \`"scalene"\` depending on how many sides are equal.
8. Rewrite question 1 (\`canVote\`) using a ternary expression instead of \`if/else\`.

## Advanced Practice

1. Write a function \`fizzBuzzOne\` that accepts a single number \`n\` and returns \`"Fizz"\` if divisible by 3, \`"Buzz"\` if divisible by 5, \`"FizzBuzz"\` if divisible by both, or the number itself (as a string) otherwise.
2. Write a function \`bmiCategory\` that accepts a \`weight\` (kg) and \`height\` (m), computes the BMI (\`weight / height^2\`), and returns \`"underweight"\`, \`"normal"\`, \`"overweight"\` or \`"obese"\` based on standard BMI ranges.`,
          },
          {
            title: "Scopes",
            content: `## High-Level Goals

By the end of this lesson, you will be familiar with the following:

- What a scope is
- Global scope vs. block scope
- Closures

## What Are Scopes

Scope represents the accessibility of variables, functions, and objects in some particular part of your code during runtime. In other words, scope determines the visibility of variables to other parts of the code.

There are two main types of scope in JavaScript: **global scope** and **local (block) scope**, with \`var\`, \`let\` and \`const\` behaving differently inside each.

### Global Scope

A variable declared outside of any function or block is in the global scope, and can be accessed from anywhere in the program.

~~~js
const name = "Meraki";

function greet() {
  // name is visible here even though it's declared outside this function
  console.log("Hello " + name);
}

greet(); // "Hello Meraki"
~~~

### Block Scope

\`let\` and \`const\` are block-scoped — they only exist inside the nearest pair of curly braces \`{ }\` (an \`if\`, a \`for\` loop, or a plain block). \`var\` ignores block scope and is only function-scoped, which is one of the reasons \`let\`/\`const\` are preferred today.

~~~js
if (true) {
  let blockScoped = "only visible inside this block";
  var functionScoped = "visible outside this block too";
}

console.log(functionScoped); // works
console.log(blockScoped); // ReferenceError: blockScoped is not defined
~~~

### Closures

A closure is formed when a function "remembers" the variables from the scope it was created in, even after that outer function has finished running.

~~~js
function createCounter() {
  let count = 0;
  return function () {
    count += 1;
    return count;
  };
}

const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3
~~~

Each call to \`createCounter()\` creates a brand-new, independent \`count\` variable that only the returned function can see or change.

## Pulse Check

1. Create a Global variable and console.log it from inside a function.
2. Explain the difference between \`var\`, \`let\` and \`const\` with respect to scope.
3. Write a function that uses closures to remember how many times it has been called.

## Practice

1. Predict the value of the following variables and explain why:

~~~js
let a = 10;
function test() {
  let a = 20;
  console.log(a);
}
test();
console.log(a);
~~~

2. Predict the output of the following snippet, then run it to check your answer:

~~~js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 0);
}
~~~

3. Write a function \`createBankAccount(startingBalance)\` that uses a closure over a private \`balance\` variable, and returns an object with \`deposit\`, \`withdraw\` and \`getBalance\` methods. The balance should not be directly accessible from outside the returned object.
4. Write a function \`makeMultiplier(factor)\` that returns a new function which multiplies any number passed to it by \`factor\`.
5. Explain, in your own words, why the code below logs \`3\` three times instead of \`0\`, \`1\`, \`2\` — and how you would fix it using \`let\`:

~~~js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
~~~

## Advanced Practice

1. Write a function \`once(fn)\` that accepts a function and returns a new function that can only be called one time — every call after the first should return the result of the first call without re-running \`fn\`.
2. Implement a simple module pattern: write an IIFE that exposes only \`increment\`, \`decrement\` and \`getValue\` while keeping the internal counter variable completely private.`,
          },
          {
            title: "Arrays",
            content: `## High-Level Goals

By the end of this lesson, you will be familiar with the following:

- Defining an array
- Accessing array elements
- Mutating an array
- Array methods

## Arrays

### What Are Arrays

An array is an ordered collection of related values. Arrays in JavaScript are flexible: they can hold a mix of types, and grow or shrink as needed.

~~~js
const colors = ["red", "green", "blue"];
~~~

### Accessing and Assigning Values

To access a value in an array we refer to its index. Array indexes start counting from \`0\`, so the first element of an array is at index \`0\`.

~~~js
const numbers = [10, 20, 30, 40];

console.log(numbers[0]); // 10
console.log(numbers[2]); // 30
console.log(numbers.length); // 4

numbers[1] = 25; // reassign the value at index 1
console.log(numbers); // [10, 25, 30, 40]
~~~

## Array Methods

Some of the most commonly used array methods:

~~~js
const fruits = ["apple", "banana"];

fruits.push("cherry"); // add to the end -> ["apple", "banana", "cherry"]
fruits.pop(); // remove from the end -> ["apple", "banana"]
fruits.unshift("mango"); // add to the start -> ["mango", "apple", "banana"]
fruits.shift(); // remove from the start -> ["apple", "banana"]

console.log(fruits.includes("banana")); // true
console.log(fruits.indexOf("banana")); // 1
console.log(fruits.join(", ")); // "apple, banana"

const sliced = fruits.slice(0, 1); // returns a new array, doesn't mutate
fruits.splice(1, 0, "kiwi"); // mutates: insert "kiwi" at index 1
~~~

## Pulse Check

1. Define the following arrays:
   - Define an array \`colors\` containing your favorite three colors.
   - Define an array \`vegetables\` containing three vegetables.
   - Define an array \`food\` containing the arrays of colors and vegetables.
2. Access the values at index \`0\` and \`2\` of the \`colors\` array.
3. Add the value \`"purple"\` to the end of the \`colors\` array using the correct method.
4. Remove the first value of the \`colors\` array using the correct method.

## Practice

1. Write a function \`addNumbers\` that accepts two numbers, \`array\` and \`string\`, and returns the array after adding the string at the end of it.
2. Write a function \`concatStrings\` that accepts a function \`array\` and two \`strings\`, and returns a string with each of the values separated by a hyphen.
3. Write a function \`toUppercase\` that accepts an array, and returns its corresponding elements depending on the request array.
4. Write a function \`isUnique\` that accepts an array and returns \`true\` if all the values of the array are unique, or \`false\` if there is a duplicate value.
5. Write a function \`removeDuplicates\` that accepts an array and returns a new array with all the duplicate values removed, without modifying the original array.
6. Write a function \`flattenArray\` that accepts an array that may contain nested arrays, and returns a single flattened array.
7. Write a function \`chunkArray\` that accepts an array and a chunk size, and returns a new array of arrays, each of the given size (the last chunk may be smaller).

## Advanced Practice

1. Write a function \`sortByProperty\` that accepts an array of objects and a property name, and returns a new array sorted by that property in ascending order.
2. Write a function \`groupBy\` that accepts an array of objects and a property name, and returns an object grouping the array items by the value of that property.`,
          },
          {
            title: "Objects",
            content: `## High-Level Goals

By the end of this lesson, you will be familiar with the following:

- Defining an object
- Accessing and assigning values
- Factory functions

## Objects

### What Are Objects

An object is an unordered collection of related data and/or functionality, represented as a set of \`key: value\` pairs. It is possible for an object's values to be functions (also known as methods).

~~~js
const person = {
  firstName: "Sara",
  lastName: "Ahmad",
  age: 24,
  greet: function () {
    console.log("Hi, I'm " + this.firstName);
  },
};
~~~

### Accessing and Assigning Values

In order to access a value in an object, we need to reference the object and the key we want to look at. Keys can also be accessed and assigned using bracket notation.

~~~js
console.log(person.firstName); // "Sara"
console.log(person["lastName"]); // "Ahmad"

person.age = 25; // reassign an existing key
person.email = "sara@example.com"; // add a brand-new key

console.log(person);
~~~

## Factory Functions

A factory function is a function that returns a new object each time it is called, without using the \`new\` keyword or a class.

~~~js
function createPerson(firstName, lastName, age) {
  return {
    firstName,
    lastName,
    age,
    greet() {
      console.log("Hi, I'm " + firstName);
    },
  };
}

const trainee1 = createPerson("Ahmad", "Nazzal", 26);
const trainee2 = createPerson("Sara", "Yousef", 23);
~~~

## Pulse Check

1. Define the following object:
   - Define an object \`person\` containing the keys \`name\`, \`age\`.
   - Access the value of the \`age\` key of the \`person\` object.
   - Assign a new value to the \`name\` key of the \`person\` object.
2. Access the values of the \`name\` key in the following object:

~~~js
const students = [
  { name: "Aya", age: 26 },
  { name: "Omar", age: 24 },
];
~~~

3. Assign the following values to the corresponding keys, then log the values of the modified objects.

## Practice

1. Import and export the following, and fix them.
2. Read the following objects and answer the questions:
   - Access the \`age\` property.
   - Modify the \`greeting\` message to say \`"hello"\` instead of \`"hi"\`.
   - Access the property nested inside the address object.
3. Access the properties of \`person\` and \`car\` with the appropriate syntax.
4. Write a factory function \`createStudent\` that accepts \`name\` and \`grade\`, and returns an object representing a student with a method \`isPassing()\` that returns \`true\` when the grade is 60 or above.
5. Write a function \`mergeObjects\` that accepts two objects and returns a new object with the combined keys of both, without mutating either input.
6. Write a function \`pickKeys\` that accepts an object and an array of key names, and returns a new object containing only those keys.
7. Write a function \`objectToArray\` that accepts an object and returns an array of \`[key, value]\` pairs.

## Advanced Practice

1. Write a function \`deepClone\` that accepts an object (which may contain nested objects and arrays) and returns a full deep copy of it, so mutating the copy never affects the original.
2. Write a function \`countProperties\` that accepts an object and returns the number of top-level keys it has, without using \`Object.keys().length\`.`,
          },
        ],
        resources: [
          {
            title: "MDN — JavaScript Guide",
            description: "The canonical guide to core JavaScript concepts.",
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 90,
            topic: "Introduction To JS",
          },
          {
            title: "Git Documentation",
            description: "Official Git reference and guides.",
            url: "https://git-scm.com/doc",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 45,
            topic: "Command Line & GIT",
          },
          {
            title: "GitHub Docs — Hello World",
            description: "A short, hands-on first walkthrough of creating a repo, branch, commit and pull request.",
            url: "https://docs.github.com/en/get-started/quickstart/hello-world",
            type: DOC,
            isRequired: false,
            estimatedMinutes: 20,
            topic: "Command Line & GIT",
          },
          {
            title: "MDN — Functions",
            description: "Function declarations, expressions, parameters and the return keyword.",
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 45,
            topic: "Functions",
          },
          {
            title: "MDN — if...else",
            description: "The if/else statement reference, plus comparison and logical operators.",
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 30,
            topic: "Conditionals",
          },
          {
            title: "MDN — Equality comparisons and sameness",
            description: "Why == and === behave differently, and when to use each.",
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Equality_comparisons_and_sameness",
            type: DOC,
            isRequired: false,
            estimatedMinutes: 20,
            topic: "Conditionals",
          },
          {
            title: "MDN — Arrays",
            description: "Reference for array creation and manipulation.",
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 45,
            topic: "Arrays",
          },
          {
            title: "MDN — Working with objects",
            description: "How objects work in JavaScript.",
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 30,
            topic: "Objects",
          },
          {
            title: "javascript.info — Array methods",
            description: "A deeper, example-driven walkthrough of array methods beyond the MDN reference.",
            url: "https://javascript.info/array-methods",
            type: DOC,
            isRequired: false,
            estimatedMinutes: 40,
            topic: "Arrays",
          },
          {
            title: "javascript.info — Object references and copying",
            description: "Why objects are copied by reference, and how to actually clone one.",
            url: "https://javascript.info/object-copy",
            type: DOC,
            isRequired: false,
            estimatedMinutes: 25,
            topic: "Objects",
          },
          {
            title: "MDN — Closures",
            description: "A deeper dive into closures, building on the scope basics covered this week.",
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 30,
            topic: "Scopes",
          },
          {
            title: "javascript.info — Variable scope, closure",
            description: "A visual explanation of the scope chain and closures with runnable examples.",
            url: "https://javascript.info/closure",
            type: DOC,
            isRequired: false,
            estimatedMinutes: 35,
            topic: "Scopes",
          },
        ],
        tasks: [
          {
            code: "JS-001",
            title: "Variables & Conditionals Practice",
            description: "Small warm-up exercises covering variables, operators and conditional logic.",
            type: TaskType.CODING,
            priority: TaskPriority.MEDIUM,
            difficulty: TaskDifficulty.EASY,
            points: 10,
            estimatedHours: 1.5,
            instructions:
              "Write a few small functions: classify a number as positive/negative/zero, compute a letter grade from a score, and check if a year is a leap year. Commit your work with clear, incremental Git commits.",
            acceptanceCriteria: [
              "Each function handles its edge cases (0, negative numbers, boundary scores)",
              "At least 3 separate, meaningful Git commits",
              "Pushed to a public GitHub repository",
            ],
          },
          {
            code: "JS-002",
            title: "Array & Object Manipulation",
            description: "Practice working with arrays of objects — a very common real-world shape.",
            type: TaskType.CODING,
            priority: TaskPriority.MEDIUM,
            difficulty: TaskDifficulty.MEDIUM,
            points: 10,
            estimatedHours: 2,
            instructions:
              "Given an array of student objects (name, grades[]), write functions to add/remove a student, compute each student's average, and find the top-scoring student. Do not mutate the original array.",
            acceptanceCriteria: [
              "Original input array/objects are never mutated",
              "Handles an empty list gracefully",
              "Pushed to GitHub",
            ],
          },
        ],
        researchQuestions: ["What is the difference between var, let and const?"],
        submissionRequirements: ["Public GitHub repository URL"],
      },
      {
        weekNumber: 2,
        title: "Iteration, Recursion, HOF & OOP",
        description:
          "Loops in depth, solving problems recursively, callbacks and higher-order functions, and object-oriented programming.",
        objectives: [
          "Choose the right loop construct for a problem",
          "Trace and write recursive functions",
          "Write and use callback functions and higher-order functions",
          "Model problems with classes and objects (OOP)",
        ],
        topics: [
          {
            title: "Iteration Part-1",
            content: `## High-Level Goals

By the end of this lesson, you will be familiar with the following:

- Defining a loop
- Using a \`for\` loop
- Iterating over strings

## What Are Loops

Loops execute a block of code repeatedly, as long as a given condition holds. Instead of writing out the same statement many times, a loop lets you repeat it a controlled number of times.

## Examples on Writing a for Loop

~~~js
for (let i = 0; i < 5; i++) {
  console.log(i);
}
// logs: 0 1 2 3 4
~~~

A \`for\` loop has three parts, separated by semicolons: the initializer (\`let i = 0\`), the condition (\`i < 5\`), and the update expression (\`i++\`).

## Iteration With Arrays

~~~js
const scores = [88, 92, 79, 65];
for (let i = 0; i < scores.length; i++) {
  console.log(scores[i]);
}
~~~

## Iteration With Strings

Strings are iterable using the same index-based pattern as arrays:

~~~js
const word = "hello";
for (let i = 0; i < word.length; i++) {
  console.log(word[i]);
}
~~~

## Common Mistakes When Using Loops

- Forgetting the stop condition, which causes an infinite loop.
- Starting a loop at the wrong index (off-by-one errors).
- Forgetting to update the loop variable inside the loop body.

## Pulse Check

1. Write a loop that logs the numbers 1 through 10.
2. Write a loop that logs every even number between 0 and 20.
3. Use a loop to reverse the characters of a string.

## Practice

1. Write a function \`sum\` that accepts an array of numbers and returns the sum of them, using a \`for\` loop.
2. Write a function \`digitsSum\` that accepts a number and returns the sum of its digits.
3. Write a function \`multiplesOf\` that accepts a number \`n\` and a \`limit\`, and returns an array of every multiple of \`n\` up to \`limit\`.
4. Write a function \`countVowels\` that accepts a string and returns how many vowels it contains.
5. Write a function \`reverseString\` that accepts a string and returns it reversed, without using \`.reverse()\`.
6. Write a function \`isPalindrome\` that accepts a string and returns \`true\` if it reads the same forwards and backwards.

## Advanced Practice

1. Write a function \`fizzBuzz\` that logs the numbers 1 to 100, but for multiples of 3 logs "Fizz", for multiples of 5 logs "Buzz", and for multiples of both logs "FizzBuzz".
2. Write a function \`printPattern\` that accepts a number \`n\` and prints a triangle of \`n\` rows of asterisks (row 1 has 1 asterisk, row 2 has 2, and so on).`,
          },
          {
            title: "Iteration Part-2",
            content: `## High-Level Goals

By the end of this lesson, you will be familiar with the following:

- Defining a loop
- Using a \`while\` loop
- Iterating over objects

## Iteration With While Loops

A \`while\` loop keeps running as long as its condition is truthy — useful when you don't know in advance exactly how many times you need to iterate.

~~~js
let count = 0;
while (count < 5) {
  console.log(count);
  count++;
}
~~~

## Iteration With Objects

Since objects aren't indexed like arrays, we iterate over them differently — most commonly with \`for...in\`, or by first converting them with \`Object.keys\`, \`Object.values\`, or \`Object.entries\`.

~~~js
const person = { firstName: "Ali", lastName: "Odeh", age: 28 };

for (const key in person) {
  console.log(key + ": " + person[key]);
}

Object.keys(person); // ["firstName", "lastName", "age"]
Object.values(person); // ["Ali", "Odeh", 28]
Object.entries(person); // [["firstName", "Ali"], ["lastName", "Odeh"], ["age", 28]]
~~~

## Troubleshooting Infinite Loops

A way of infinite loop likely to happen is forgetting to update the loop's condition variable inside the loop body. If your browser tab freezes, close it and re-check the loop's update step.

## Pulse Check

1. Write a \`while\` loop that logs the numbers 10 down to 1.
2. Loop over the following object and console log all its keys.
3. Loop over the following object and console log all its values.

## Practice

1. Write a function \`hasAllVowels\` that accepts an object and returns \`true\` if all its values include the letter \`"a"\`.
2. Write a function \`invertObject\` that accepts an object and swaps its keys and values, returning the new object.
3. Write a function \`passedStudents\` that accepts an object of student grades and returns a new object containing only the students who passed (grade >= 60).
4. Write a function \`sumValues\` that accepts an object with only numeric values, and returns the sum of the values.
5. Write a function \`countKeys\` that accepts an object and returns how many keys it has, using a loop (not \`Object.keys().length\`).
6. Write a login function \`login\` that accepts an object of \`username\`/\`password\` pairs and a given username and password, and returns \`"login successful"\` or \`"login failed"\` accordingly.

## Advanced Practice

1. Write a function \`compare\` that accepts two objects and returns \`true\` if they have all of the same keys and values.
2. Write a function \`sumNested\` that accepts an object of nested objects and returns the sum of all the numeric values at every level.
3. Write a function \`mergeAndSum\` that accepts two objects and merges them into one, summing the values of keys that appear in both.`,
          },
          {
            title: "Recursion",
            content: `## High-Level Goals

By the end of this lesson, you will be familiar with the following:

- The definition of recursion
- Using recursion

## What Is Recursion

Recursion is the process by which a function calls itself, either directly or indirectly. A recursive solution repeats the same steps to break a problem down, with a base case that stops the recursion.

~~~js
function countdown(number) {
  console.log(number);
  if (number === 0) {
    return console.log("Countdown is over");
  }
  return countdown(number - 1);
}

countdown(3);
// 3
// 2
// 1
// 0
// Countdown is over
~~~

## Why Do We Use Recursion

Many problems (traversing trees, nested data, or "divide and conquer" algorithms) are naturally expressed recursively — the recursive version is often much shorter and easier to reason about than an equivalent loop, even though it isn't always the most performant option.

## Recursion Common Mistakes

- Forgetting the base case, so the function calls itself forever until the call stack overflows.
- Not making steady progress toward the base case on every recursive call.
- Forgetting the \`return\` keyword, so the recursive result never bubbles back up.

## Pulse Check

1. Write a recursive function that counts up from 0 to a given number.
2. Modify \`countdown\` above to accept a positive number and well-handle decrement by 2.
3. Use the debugger to step through a recursive call and see the stack grow and shrink.

## Practice

1. Write a function \`factorial\` that accepts a number and returns the factorial of that number.
2. Write a function \`sumArray\` that accepts an array of numbers and returns the sum of the values, recursively.
3. Write a function \`getLength\` that accepts a string, and returns its length, recursively.
4. Write a function \`reverseString\` that accepts a string, and returns a string in reversed order, recursively.
5. Write a function \`countOccurrences\` that accepts a string and a character, and returns the number of times that character has been repeated, recursively.
6. Write a function \`addition\` that accepts two numbers, arguments, and returns their multiplication without the \`*\` operator, recursively.
7. Write a function \`isPalindrome\` that accepts a string and returns \`true\` if it's a palindrome, or \`false\` if it's not, recursively.
8. Write a function \`fibonacci\` that accepts a number and returns the value at that index of the Fibonacci sequence, recursively.

## Advanced Practice

1. Write a function \`sumNestedArray\` that accepts an array of numbers, and returns the sum of all its elements, no matter how deeply nested the array is.
2. Write a function \`flattenArray\` that accepts a nested array and returns a new one-dimensional array with all its elements, recursively.
3. Write a function \`cloneFamilyTree\` that accepts a nested object describing a family tree and returns a new deep-cloned copy of all the objects inside, recursively.`,
          },
          {
            title: "CB & HOF",
            content: `## High-Level Goals

By the end of this lesson, you will be familiar with the following:

- The definition of a callback
- The definition of higher order functions

## Callbacks

### What Is A Callback Function

Functions that get passed to or returned by another function are called callback functions. Callbacks are mostly used with asynchronous code, but the idea applies just as well to synchronous code.

~~~js
function greet(name, callback) {
  console.log("Hello " + name);
  callback();
}

greet("Sara", function () {
  console.log("This runs after the greeting");
});
~~~

## Higher Order Functions

### What Is A Higher Order Function

A higher order function is a function that takes another function as an argument, returns a function, or both. Some of the most commonly used built-in higher order functions:

~~~js
const numbers = [1, 2, 3, 4, 5];

// map: used to transform each element of an array
const doubled = numbers.map((n) => n * 2);

// filter: used to keep or filter out elements depending on a condition
const evens = numbers.filter((n) => n % 2 === 0);

// reduce: used to reduce all the elements of the array into a single value
const total = numbers.reduce((acc, n) => acc + n, 0);
~~~

## Pulse Check

1. Write a function that accepts two numbers, \`number1\` and \`number2\`, and a callback, and calls the callback with the two numbers.
2. Using \`array.map\`, double every value in the array.
3. Using \`array.filter\`, filter the array of student objects who have failed.

## Practice

1. Write a function \`useCallback\` that accepts an array of numbers and returns an array of their doubled values.
2. Write a function \`averageGrade\` that accepts an array of student grades and returns the average grade. If any empty array is passed to the function, return "Please enter at least one grade".
3. Write a function \`mergeAndSort\` that accepts two arrays of strings, and returns a new array sorted alphabetically depending on the request array.
4. Write a function \`incrementNums\` that accepts an array of nested arrays and returns an array where each of the inner arrays' numbers are incremented by 1.
5. Write a function \`sortWords\`, that accepts a string, and sorts the words of the string in the order of that string.
6. Write a function \`pluckKeys\` that accepts an array of objects and returns an array of only the specified keys and values, based on the given object.
7. Write a function \`allNumbers\` that accepts an array and returns \`true\` if all the values are numbers and returns \`false\` if not.
8. Write a function \`countOccurrences\` that accepts an array of values and returns an object with the count of the corresponding key.
9. Write a function \`fibonacci\` that accepts a number, and returns an array of the Fibonacci sequence up to that number.

## Advanced Practice

1. Write a function \`loop\` that accepts arguments \`array\` and a callback function. The function should iterate on the array and call the callback function on each item.
2. By using the function \`loop\`, write a function \`filter\` that accepts arguments \`array\` and \`callback\`, and returns a new array of all the elements that were kept by the callback function (just like \`array.filter\`).
3. By using the function \`loop\`, write a function \`map\` that accepts arguments \`array\` and \`number\`, and returns a new array with the callback applied to each element (just like \`array.map\`).
4. By using the function \`loop\`, write a function \`reduce\` that accepts arguments \`array\`, \`callback\` and \`accumulator\`, and returns an accumulated single value (just like \`array.reduce\`).`,
          },
          {
            title: "OOP",
            content: `## High-Level Goals

By the end of this lesson, you will be familiar with the following:

- The definition of Object Oriented Programming (OOP)
- Using classes

## What Is OOP

Object oriented programming is the process of using objects to represent items and portions of code, so we can organize our programs into reusable, self-contained pieces called classes. A class is a "blueprint" from which objects (instances) are created.

## OOP Using Classes

Classes are defined using the keyword \`class\`, and they are constructed with the keyword \`new\`. Every class has a special \`constructor\` method that runs when a new instance is created.

~~~js
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  greet() {
    console.log("Hi, I'm " + this.name);
  }
}

const ahmad = new Person("Ahmad", 26);
ahmad.greet(); // "Hi, I'm Ahmad"
~~~

## Interface Using Extends

Inheritance lets a class reuse and extend the methods and properties of another class using the keyword \`extends\`.

~~~js
class Trainee extends Person {
  constructor(name, age, cohort) {
    super(name, age); // calls Person's constructor
    this.cohort = cohort;
  }

  greet() {
    super.greet();
    console.log("I'm in cohort " + this.cohort);
  }
}

const sara = new Trainee("Sara", 24, "C14");
sara.greet();
~~~

## Pulse Check

1. Define a class \`Car\` with a constructor that accepts \`make\` and \`model\`, and a method \`describe\` that logs them.
2. Create an instance of \`Car\` and call \`describe\` on it.
3. Create a class \`ElectricCar\` that extends \`Car\` and adds a \`batteryRange\` property.

## Practice

1. Write a class \`Rectangle\` with a constructor that accepts \`width\` and \`height\`, and methods \`getArea()\` and \`getPerimeter()\`.
2. Write a class \`BankAccount\` with a constructor that accepts a starting \`balance\`, and methods \`deposit(amount)\`, \`withdraw(amount)\` and \`getBalance()\`. \`withdraw\` should refuse to overdraw the account.
3. Write a class \`Animal\` with a \`makeSound()\` method, then a class \`Dog\` that extends \`Animal\` and overrides \`makeSound()\` to log "Woof!".
4. Write a class \`Playlist\` that holds an array of \`Song\` instances (title, artist, duration), with methods to add a song, remove a song by title, and compute the playlist's total duration.
5. Write a static method on a class \`MathUtils\` called \`isEven\` that accepts a number and returns \`true\`/\`false\` without creating an instance of the class.

## Advanced Practice

1. Build a small \`Library\` class that holds \`Book\` instances (title, author, isCheckedOut). Add methods to check a book in/out, and use \`map\`/\`filter\`/\`reduce\` to report available books and books by a given author.
2. Write a class hierarchy \`Shape\` -> \`Circle\`/\`Square\`/\`Triangle\`, each overriding a shared \`getArea()\` method, then write a function that accepts an array of mixed shapes and returns the total area of all of them.`,
          },
        ],
        resources: [
          {
            title: "MDN — Loops and iteration",
            description: "for, while, for...of and for...in compared.",
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 30,
            topic: "Iteration Part-1",
          },
          {
            title: "MDN — Array.prototype methods",
            description: "map, filter, reduce and other higher-order array methods.",
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 45,
            topic: "CB & HOF",
          },
          {
            title: "javascript.info — for...in / Object iteration",
            description: "Iterating over objects: for...in, Object.keys/values/entries compared.",
            url: "https://javascript.info/object#for-in-loop",
            type: DOC,
            isRequired: false,
            estimatedMinutes: 20,
            topic: "Iteration Part-2",
          },
          {
            title: "javascript.info — Recursion and stack",
            description: "How the call stack grows during recursion, with visual diagrams.",
            url: "https://javascript.info/recursion",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 40,
            topic: "Recursion",
          },
          {
            title: "MDN — Classes",
            description: "The full class syntax reference: constructors, inheritance, static members.",
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 45,
            topic: "OOP",
          },
        ],
        tasks: [
          {
            code: "JS-003",
            title: "Recursion Practice",
            description: "Classic recursive problems.",
            type: TaskType.PROBLEM_SOLVING,
            priority: TaskPriority.MEDIUM,
            difficulty: TaskDifficulty.MEDIUM,
            points: 10,
            estimatedHours: 1.5,
            instructions:
              "Implement factorial, a Fibonacci sequence generator, and a function that sums nested arrays of arbitrary depth — all recursively.",
            acceptanceCriteria: [
              "No loops used in any of the three solutions",
              "Each has a correct base case",
              "Pushed to GitHub",
            ],
          },
          {
            code: "JS-004",
            title: "OOP & Higher-Order Functions",
            description: "Combine classes with array higher-order methods.",
            type: TaskType.CODING,
            priority: TaskPriority.MEDIUM,
            difficulty: TaskDifficulty.MEDIUM,
            points: 12,
            estimatedHours: 2,
            instructions:
              "Build a small `Library` class that holds `Book` instances (title, author, isCheckedOut). Add methods to check a book in/out, and use map/filter/reduce to report available books and books by a given author.",
            acceptanceCriteria: [
              "Uses at least one class with a constructor and methods",
              "Uses map/filter/reduce rather than manual loops for the reporting methods",
              "Pushed to GitHub",
            ],
          },
        ],
        researchQuestions: [
          "What is a base case, and what happens if a recursive function is missing one?",
          "What's the difference between a regular function and an arrow function with respect to `this`?",
        ],
        submissionRequirements: ["Public GitHub repository URL"],
      },
      {
        weekNumber: 3,
        title: "HTML/CSS, DOM, jQuery & Project 1",
        description:
          "A first look at HTML and CSS, deeper CSS (layout and positioning), design fundamentals, DOM manipulation, jQuery, and your first solo project.",
        objectives: [
          "Structure a page with semantic HTML and style it with CSS",
          "Build multi-column and flex/grid page layouts, and position elements correctly",
          "Apply basic design fundamentals (spacing, hierarchy, contrast)",
          "Read and manipulate the DOM from JavaScript, including with jQuery",
          "Scaffold and plan a new project from scratch",
        ],
        topics: [
          {
            title: "HTML",
            content: `## High-Level Goals

By the end of this lesson, you will be familiar with the following:

- The definition of HTML
- Using HTML tags
- Using attributes

## What Is HTML

Hypertext Markup Language (HTML) is the standard markup language for documents designed to be displayed in a web browser. It can be assisted by technologies such as Cascading Style Sheets (CSS, used to customize the style of the website) and scripting languages such as JavaScript (used to make the website dynamic).

HTML elements are the building blocks of HTML pages — they're portrayed by tags and written using angle brackets.

~~~html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <h1>Hello World</h1>
  </body>
</html>
~~~

## HTML Tags

There are three types of HTML tags: opening, closing, and self-closing. Most elements are made of an opening and closing tag; a few (like \`<img>\` or \`<input>\`) are self-closing.

HTML elements can be displayed inline or as blocks: block elements take up the whole width and push the next element below them, while inline elements only take the space they need and let other elements sit next to them.

Common tags: header (\`h1\`-\`h6\`), paragraph (\`p\`), button, input, ordered/unordered list (\`ol\`/\`ul\`), dropdown list (\`select\`), \`div\`, and \`script\`.

## HTML Attributes

Attributes provide additional information about an element, as a \`key="value"\` pair added to the opening tag.

~~~html
<p title="tooltip about the paragraph">This is a paragraph</p>
<input type="text" placeholder="Enter Text" />
<img src="img_name.jpg" alt="img description" />
<a href="https://www.google.com/">Google</a>
<p id="paragraph">This is a paragraph</p>
<a href="#paragraph">Go to paragraph</a>
<script src="main.js"></script>
~~~

## Practice

1. Create an HTML file to work on — make sure the file extension is \`.html\` and add the basic \`html\`, \`head\`, and \`body\` tags, and give it the title \`Animal Blog\`.
2. Add a header tag (\`h1\`) saying "Cute Animal Blog" then add a paragraph underneath explaining what the blog is about.
3. Add an unordered list of your favorite animals (at least 5).
4. Add an anchor tag for every item in the list that links to an external website (Wikipedia, for example) with information about the animal.
5. After the list, add a header (\`h2\`) saying "Gallery" and then an image for each of the animals.
6. Add a paragraph underneath every picture explaining a little bit about each animal — don't forget to add a \`title\` attribute with an appropriate message.
7. Create a new file \`contact.html\` and link to it from the main page. The contact page should have contact information (doesn't need to be real).
8. Create a new file \`login.html\` and link to it from the main page. The login page should contain two inputs, one of which should be an email type and the other a password type. There should also be a login button below them — don't forget to label the inputs.
9. Create a new file \`register.html\` and link to it from the login page. The register page should contain three inputs, one email type and two password types, and a register button — label everything.`,
          },
          {
            title: "CSS Introduction",
            content: `## High-Level Goals

By the end of this lesson, you will be familiar with the following:

- The definition of CSS
- Using different ways to style the page
- CSS selectors

## CSS

### What Is CSS

Cascading Style Sheets are used to format the layout of web pages by describing how HTML elements are displayed — color, size, font, margins, padding, and much more.

### CSS Rules

A CSS rule is made of two sections: the selector, and the declaration block. Selectors target a specific element or group of elements to style; the declaration block holds the properties and values, separated by semicolons.

Selector types: tag selector, class selector (\`.name\`), and ID selector (\`#name\`).

## Where To Use CSS

### Internal CSS

~~~html
<head>
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
      color: white;
      background-color: black;
    }
    h1 {
      font-weight: bold;
      color: #d8c40d;
    }
  </style>
</head>
~~~

### Inline CSS

~~~html
<h1 style="color:blue; font-size:22px;">Hello World</h1>
~~~

### External CSS

~~~css
/* style.css */
body {
  background-color: black;
  color: white;
}
~~~

~~~html
<link rel="stylesheet" type="text/css" href="style.css" />
~~~

External CSS is the preferred way to style a page since it keeps the style separate from the HTML, and the same stylesheet can be reused across multiple pages.

### CSS Rule Priorities

The more specific a CSS rule is, the higher priority it has — an inline style beats a class or tag selector, and an ID beats a class. The \`!important\` keyword overrides any of that, regardless of specificity, so use it sparingly.

## Practice

1. Create a new CSS file with the extension \`.css\`, and connect it to a new HTML page using the \`link\` tag.
2. Change the background color and the text to a color of your choosing.
3. Create an unordered list with three items — Home, About, Contact — then change the background color for the \`ul\` to be a different color than the \`body\`; add an anchor tag to each list item with \`href="#"\` (doesn't link anywhere).
4. Read about \`text-decoration\` and remove the underline on the anchor tags.
5. Add an on-hover pseudo-class on the anchor tags that changes their color, and also when visited change the color.
6. Read about the \`display\` CSS property and display the list items horizontally, then read about \`float\` and display the third list item, "Contact", on the right side while everything else is on the left.
7. Add an image and make it circular — read about the \`border-radius\` property.
8. Add a multi-line paragraph, read about \`line-height\`, and change the \`line-height\`, \`font-size\`, \`font-family\`, and \`color\`.`,
          },
          {
            title: "CSS Part-2 Page Layouts",
            content: `## High-Level Goals

By the end of this lesson, you will be familiar with the following:

- CSS Flexbox
- CSS Grid

## Page Layouts

CSS layout modules are used to create responsive and reusable page structures without the use of positions and floats. Flexbox is easy to reach for when it wouldn't work well with \`position\` and \`float\`, while CSS Grid shines when the layout naturally splits into rows and columns.

### CSS Flexbox

~~~css
.parent {
  display: flex;
  flex-wrap: wrap;
  background-color: rgb(20, 24, 145);
}

.child {
  height: 100px;
  border: 1px solid white;
  color: white;
}
~~~

Some of the properties available on the flex container: \`flex-direction\` (row/column), \`justify-content\` (main-axis alignment), \`align-items\` (cross-axis alignment), \`flex-wrap\`, and \`gap\`. On flex items: \`flex-grow\`, \`flex-shrink\`, and \`order\`.

### CSS Grid

Grid layout is used to create a grid-based layout with rows and columns, similarly to Flexbox is used to design a flat layout.

~~~css
.parent {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 100px 100px;
  gap: 10px;
}

.child-large {
  grid-column: span 2;
}
~~~

## Practice

Using CSS Grid and/or Flexbox, recreate the home page of a website (of your own choosing) that has a hero section, an "About" section with several cards, and a "Contact us" section with a form.

1. Think about the sections and their layout before you start.
2. Create a hero section, use the \`img\` tag or the CSS \`background-image\` property, and place the CTA button in the middle of it.
3. Create an about-us section, an "our services" or "our products" section, that lays out several cards in a row (or wraps to a new row when there isn't enough space).
4. Think about the middle section of your website — it's not going to be any fun if everything you build is a copy-paste of what you already made.
5. Finally, create a contact us / send-us-a-message section with a form.`,
          },
          {
            title: "CSS Part-3 Position",
            content: `## High-Level Goals

By the end of this lesson, you will be familiar with the following:

- The float CSS property
- The position CSS property
- Media queries

## Page Layouts

### Float

The \`float\` property is used to specify how an element should float. It has four values: \`left\` and \`right\` are used to float the item to the left or right side, \`none\` is the default (does not float the element), and \`inherit\` makes the element inherit the float value from its parent.

~~~html
<button id="b1">left</button>
<button id="b2">right</button>
~~~

~~~css
#b1 {
  float: left;
}
#b2 {
  float: right;
}
~~~

### Position

The \`position\` property is used to position an element on the screen. There are five values: \`static\` (default), \`relative\` (offset from its normal position), \`fixed\` (relative to the viewport, stays in place when scrolling), \`absolute\` (relative to the nearest positioned ancestor), and \`sticky\` (a hybrid of relative and fixed).

### Media Queries

Media Queries are used to apply different CSS depending on a condition, which is very helpful when creating responsive designs. It's always good practice to design mobile-first (small screens as the default) and then add versions for tablets and desktops.

~~~css
.parent {
  display: grid;
  justify-content: center;
  gap: 10px;
  grid-template-columns: repeat(4, 150px);
  background-color: gray;
}
.child {
  height: 100px;
  background-color: white;
}

/* @media is the keyword used to create media queries */
@media all and (max-width: 800px) {
  .parent {
    grid-template-columns: repeat(3, 200px);
  }
  .child {
    height: 150px;
    color: rgb(255, 255, 0);
  }
}

@media (max-width: 500px) {
  .parent {
    grid-template-columns: repeat(2, 200px);
  }
}

@media (orientation: landscape) {
  .child {
    color: rgb(0, 255, 0);
  }
}
@media (orientation: portrait) {
  .child {
    color: rgb(255, 0, 255);
  }
}

/* it's possible to create an "and" condition */
@media (orientation: landscape) and (max-height: 600px) {
  .child {
    color: rgb(0, 255, 0);
  }
}
/* the comma represents an "or" statement */
@media (orientation: landscape), (max-height: 600px) {
  .child {
    color: rgb(255, 255, 0);
  }
}
~~~

## Practice

Using \`float\` and \`position\` recreate the look of your chosen website for the following:

1. This time, review a section, and think about how an image on it might be shifted or overlap with the layout by using the \`float\` or \`position\` properties (however it should look reasonable).
2. Around a header, add an about-us section in the \`<header>\` tag, and link out to an appropriate external site (LinkedIn, etc.) for at least one contact icon.
3. Add media queries so the page looks good on tablet and mobile widths, at the breakpoints of your choice.
4. Style the contact us / send-us-a-message section so it's laid out well on both desktop and mobile.`,
          },
          {
            title: "Design Fundamentals",
            content: `## High-Level Goals

By the end of this lesson, you will be familiar with the following:

- UI
- UX
- Design Fundamentals

## User Interface (UI)

A user interface is what allows a human to interact with a machine, and comes in many different forms — mouse and keyboard, touch and gesture screens, displays showing information, microphones and speakers, applications and specific operations, and computer/cover screens (touch, LED points, etc).

## User Experience (UX)

UX is about the experience of the user when dealing with a product. The better the experience, the more likely users will be willing to use the product again. A good UX experience relies on how the user feels while interacting with your product's interface, in physical or digital products, and can still apply the same principles which is what we focus on in design.

Principles for a good user experience:

- **Usability** — how easy it is to navigate and use, the more intuitive the better.
- **Usefulness** — how well the product is fulfilling the user's needs.
- **Accessibility** — the ability of a product to be usable by people with disabilities.
- **Desirability** — how emotionally appealing a design is, and how it fits its branding.
- **Credibility** — how much the user trusts the product enough to act on it.
- **Findability** — how easy it is to find a piece of information the user needs.
- **Valuable** — how valuable the product is to the user, and all the steps before valuable are the sum.

## Web Development Design Fundamentals

### Color

One of the most important aspects of any design is the use of color and how it interacts with quality colors. When building a color palette for a website, we often use a base and a few colors depending on scale, complementary, mood, and matching styles.

### Contrast

Contrast is defined as being a different shade or opposite (dark or light) from another thing, and it usually is a comparison of the element and its background. Contrast usually needs to hit certain accessibility guidelines (WCAG) for color contrast, so check the color contrast against a WCAG contrast checker.

### White Space

White space is the empty space around the elements in the UI — it also forms a visual negative space, giving the eye somewhere to rest.

### Alignment

Alignment is positioning the elements in relation to the other elements in the UI. Each element in the UI defines a reference point in the shape of columns and rows.

### Scale

Scale is about the size of the elements, scale can be used to make elements more visible and it can be used to contrast the white space when it needs to be used, so keep the right scale in relation with the surroundings while keeping things clear and desirable for the user.

### Typography & Visual Hierarchy

Typography is everything that has to do with text affected by the color, its design fundamentals, depending on the style, type, weight, spacing, height, alignment, etc.

Visual hierarchy is the most important part of the way visitors scan a page — the elements a user can see first are ranked by their design importance, in order to guide their attention through the page in the intended order.

## Practice

Pick a real (or your own) product idea and, before writing any code, prepare a short design plan for it:

1. Choose a color palette (a primary color plus 2–3 supporting colors) and check its contrast against WCAG guidelines.
2. Sketch (on paper or in a tool like Figma/Moqups) the layout of your homepage, paying attention to white space, alignment, and scale.
3. Decide on your typography: pick a heading font and a body font, and define at least 3 font sizes for your visual hierarchy (e.g. page title, section title, body text).
4. Write a short paragraph explaining how your design choices support usability and findability for a first-time visitor.`,
          },
          {
            title: "DOM Manipulation",
            content: `## High-Level Goals

By the end of this lesson, you will be familiar with the following:

- The definition of DOM
- Changing HTML elements
- Changing HTML attributes
- Modifying current CSS styles and creating new ones
- The definition of event listeners
- Using event listeners

## DOM Manipulation

### What Is The DOM

The Document Object Model (DOM) is a programming interface for HTML and XML documents which allows programs to change the structure, style and content of a page. Using JavaScript we can add, delete, and update any HTML element, attribute, event or CSS style.

### Selecting HTML Elements

~~~js
// querySelector allows us to get a reference to the first matching element
const body = document.querySelector("body");
body.style.display = "none";

// querySelectorAll returns a NodeList (array-like) of every matching element
const paragraphs = document.querySelectorAll("p");
paragraphs[0].style.color = "red";

// select by id or class the same way you would in CSS
const article = document.querySelector("#article");
const cards = document.querySelectorAll(".card");
~~~

### Modifying HTML Attributes

~~~js
const link = document.querySelector("a");
link.href = "https://www.google.com";
link.target = "_blank";
~~~

### Creating and Removing HTML Elements

~~~js
const header = document.createElement("h1");
header.innerText = "Header One";
header.id = "header-id";

const body = document.querySelector("body");
body.append(header); // add as the last child
header.remove(); // remove the element from the DOM
~~~

### Event Listeners

Event listeners are connected to the DOM and can execute code depending on which event has triggered — click, change, hover, key press, etc.

~~~js
const submitButton = document.createElement("button");
submitButton.addEventListener("click", () => {
  console.log("Submit button has been clicked");
});

const profilePic = document.querySelector("#profile-pic");
profilePic.addEventListener("mouseover", () => {
  console.log("Profile picture has been hovered");
});
~~~

### Removing an Event Listener

~~~js
const editButton = document.createElement("button");
const editUser = () => console.log("editUser has been called");
editButton.addEventListener("click", editUser);
// removeEventListener needs the exact same function reference
editButton.removeEventListener("click", editUser);
~~~

### The Event Parameter

The \`event\` parameter contains an object with information about the event that happened.

~~~js
const emailInput = document.createElement("input");
emailInput.addEventListener("change", (e) => {
  console.log(e.target.value + " is the current value of the input");
});
~~~

## Practice

1. Create an empty HTML page and connect it to a JavaScript file using a script tag.
2. Using DOM manipulation, create two new elements when the page loads: a header saying "Todo List" and an empty unordered list below it.
3. Create a \`todos\` global variable holding three to-do items: "wake up", "eat breakfast", and "code".
4. Create a function \`renderList\` that renders the to-do items from \`todos\` as list items in the unordered list — make sure the function is dynamic (renders all items regardless of the size), and call it when loading the page.
5. Using DOM manipulation, create an input and a button. When clicking on the button it should invoke a function \`addToList\` that will use the input's value to add it to the \`todos\` variable — make sure to re-render on the screen as a new list item in the unordered list.
6. Create a button next to every list item that would delete the corresponding element by invoking a function \`deleteListItem\` — make sure to try deleting multiple items and check if the right item is being deleted every time.
7. Using DOM manipulation, create a new button for each list item that would invoke a function \`updateListItem\` that will ask the user for input and take the value provided by the user to use it to update the corresponding list item.`,
          },
          {
            title: "How To Start A Project",
            content: `## High-Level Goals

By the end of this lesson, you will be familiar with the following:

- Planning for a project
- Designing the web app

## Before You Start

### Think Of The Idea Thoroughly

One of the important things to do is to think thoroughly about the idea, and more precisely about the features it's going to have. Some suggestions to consider when planning:

- Think about the main features and estimate how much time you'll need to implement each one.
- Think about how to make the idea feel more unique.
- Think about how to increase the scale and improve it in the future.
- Fill in your project information sheet and wait for confirmation before you start coding.

### Design The Layout In Advance

Designing the layout before you start is an important step because it defines the idea in a clearer way, and might let you notice features you have missed or need to add.

- Design the basic layout of the website by drawing it digitally or by hand — you can create a wireframe using Moqups or MockFlow.
- Depending on the design, think about how you could use CSS \`grid\` or \`flex\` to implement it.
- Split the design into sections to select elements more easily — for example \`#about h1\`, \`#about p\`, \`#contact input\`, \`#contact button\`.
- Think about how you can group similar elements using the same class for reusable styling.

### Prepare The Repository

Create the repository and clone it early so you don't forget, and make sure Git is working as it should before you write any real code.

## After You Start

- Create the basic layout with the different sections, without filling out the content.
- Start by doing one section at a time.
- Work on the simple content first (HTML), then the logic (JS), and when done add the styling (CSS).
- Commit the changes frequently after every feature is done (after HTML, JS, and CSS changes).
- Push the code every hour, so it can be monitored, even if there aren't many changes done.
- Make sure to document the code using comments.
- If you feel stuck, ask for help.

## When You Finish

- Clean the code, fix indentation, remove unnecessary \`console.log\`s, and convert ES5 code to ES6 (if any found).
- Test the whole project.
- Record a 3-5 minute video demoing your project.
- The video should be a recording of your screen while showcasing the features and commentating on it.
- Upload the video before the deadline.

## Practice

Before starting Project 1, write a short project plan covering:

1. Your project idea (pick one from the ideas list, or your own — as long as it meets the minimum requirements).
2. A wireframe/sketch of the main pages/views.
3. A list of the sections you'll build, in the order you plan to build them.
4. Your GitHub repository, created and cloned, with an initial commit already pushed.`,
          },
          {
            title: "JQuery",
            content: `## High-Level Goals

By the end of this lesson, you will be familiar with the following:

- jQuery
- DOM manipulation using jQuery

## What Is jQuery

jQuery is a lightweight and feature-rich JavaScript library that makes development with vanilla JavaScript simpler. jQuery is capable of doing many things, but for this lesson we focus on DOM manipulation and event handling.

## How To Use jQuery

Add the CDN script tag to the \`head\` of your HTML page:

~~~html
<!DOCTYPE html>
<html lang="en">
  <head>
    <script
      src="https://code.jquery.com/jquery-3.6.0.js"
      integrity="sha256-H+K7U5CoNJvitc+cHUam"
      crossorigin="anonymous"
    ></script>
  </head>
</html>
~~~

To test that jQuery is working, open the console and type \`jQuery\` or \`$\` (a shorthand for \`jQuery\`) — the \`$\` function is used every time we want to use a method from jQuery.

## DOM Manipulation Using jQuery

### Selecting HTML Elements

~~~js
const body = $("body");
const listItems = $("li");

const hero = $("#hero");
const callToAction = $("#hero button");
const container = $(".container");
~~~

### Modifying HTML Attributes

~~~js
const header = $("#header");
header.text("Hello World"); // set text
header.text(); // "" -> reads the current text instead of setting it

header.addClass("Main-Header blue-bg"); // add one or more classes
header.removeClass("blue-bg"); // remove a class
header.css("color", "red"); // add or modify a single CSS property
header.css({ "font-size": "50px", color: "blue" }); // set multiple properties at once

header.hide(); // hide the element
header.show(); // show it again if hidden
~~~

### Creating and Removing HTML Elements

~~~js
const paragraph = $("<p> Hello there </p>");
const navbar = $(
  '<div id="nav"><div>logo</div> <a href="#"> home </a> <a href="#"> about </a> </div>'
);
navbar.css("display", "flex");

const body = $("body");
body.append(paragraph); // add as the last child
body.appendTo(paragraph); // same effect, different order
body.prepend(navbar); // add as the first child

paragraph.remove(); // remove the element from the DOM
~~~

### Adding Event Listeners

~~~js
const listItems = $(".listItems");
listItems.on("click", () => {
  console.log("List item has been clicked");
});

listItems.on("mouseover", function () {
  // "this" refers to the element itself, use ES5 syntax to have the correct reference
  $(this).css("color", "red");
  console.log("color has been changed");
});

const mainHeader = $(".main-header");
mainHeader.on("click", () => {
  console.log("Main header has been clicked");
});
~~~

### Removing Event Listeners

~~~js
$("button").off(); // removes all event listeners from the selected buttons
$("button").off("click"); // removes all click event listeners from the selected buttons
~~~

## Practice

**Note**: solve the questions below using jQuery — do NOT use vanilla JavaScript for DOM manipulation (selecting, creation, modifying, etc).

1. Create an empty HTML page and connect it to a JavaScript file using a script tag.
2. Using jQuery, create two new elements when the page loads: a header saying "Todo List", and an empty unordered list below it.
3. Create a \`todos\` global variable holding three to-do items: "wake up", "eat breakfast", and "code".
4. Create a function \`renderList\` that renders the to-do items from \`todos\` as list items in the unordered list — make sure the function is dynamic and gets invoked when loading the page.
5. Using jQuery, create an input and a button. When clicking on the button it should invoke a function \`addToList\` that will use the input's value to add it to the \`todos\` variable — make sure to re-render on the screen as a new list item.
6. Create a button next to every list item that would delete the corresponding element by invoking a function \`deleteListItem\` — make sure to try deleting multiple items and check if the right item is being deleted every time.
7. Using jQuery, create a new button for each list item that would invoke a function \`updateListItem\` that will ask the user for input and take the value provided by the user to use it to update the corresponding list item.`,
          },
          {
            title: "Project 1",
            content: `## High-Level Goals

The goal of this project is to practice individually creating a dynamic website using what you have learned.

## Project Idea

The project idea must be one of the following:

- Quiz
- Hangman
- Memory Card Game
- XO Game

## Project Requirements

Project requirements must be met (minimum requirements):

- Created a repo on your GitHub account named \`MERAKI_Academy_Project_1\`.
- Draw a sketch that describes your game (a wireframe — Moqups or MockFlow).
- Project must be ready before the deadline.
- The video must be uploaded before the deadline.
- Write clean code with good style (use a Prettier extension).
- HTML, CSS, and JS must be used in the project.
- Must have separate files for HTML, CSS, and JS.
- Must use DOM manipulation to make the website dynamic.
- Must use CSS Grid or Flexbox.
- Must use ES6.

## Project Stretch Goals

- Fully responsive design for both mobile and desktop (CSS media queries).
- Using local storage to persist data even after refresh.
- Deploy the website using Netlify.

## Game User Story

**Quiz Game**
- User will see a question with multiple answers.
- User will be able to choose any answer, and press "Next" until finish.
- When finished, the user will see a screen with the result and a "Play Again" button.

~~~js
const questions = [
  {
    id: 1,
    q: "",
    answers: [],
    correctAnswer: "", // add more key/value if needed
  },
];
~~~

**Hangman Game**
- User will see a text showing the number of letters in the word.
- User will see the alphabet buttons and choose any of them.
- Chosen letters get checked correct/wrong, which affects the body parts of the man (show/hide).
- When finished, the user will see a screen with the result and a "Play Again" button.

**Memory Card Game**
- User will see a number of cards, each couple holding the same picture.
- Cards appear for a period of time (e.g. 10 seconds) then flip to the other side.
- User chooses two cards, which get checked correct/wrong.
- When finished, the user will see a screen with the result and a "Play Again" button.

**XO Game**
- This is a multiplayer game — one of the players wins by filling the correct blocks with X or O in the same direction (a multi-dimensional array holds the X/O elements).
- Display a screen with 9 empty blocks in a 3x3 grid.
- Blocks can be filled with X or O when clicked, based on the current turn.
- After filling a block, check if there's a winning combination — check rows, columns, and diagonals.
- If there's a winner, display a new screen with the winner's name and a "Play Again" button.
- If there's no winner and the grid is full, display a tie-game screen with a "Play Again" button.

~~~js
// multi-dimensional array — think of it as a table holding the X/O elements
/* Table
|X|O|X|
|O|X|X|
|O|X|O|
*/
const blocks = [[], [], []];
~~~

## Extra Features For All Games

- Starter/welcome screen with a "How to Play" explanation.
- Sound effect for answer status.
- Background music with an on/off toggle.
- A progress bar (e.g. "5/10") showing how many questions are finished.
- A timer.
- Multiple categories (Math, Coding, Science, Fun).
- Shuffle the questions/words/cards randomly, depending on the game.
- Use local storage to save player names and keep the best score.
- Level limits on the number of attempts (3, 5, 7).
- Hints.
- Deploy the website using Netlify or GitHub Pages.
- Fully responsive design for both mobile and desktop (CSS media queries).

> **Note**: make sure your game is challenging, with counters for failed attempts, etc. Anything you do in HTML more than twice should be built using JavaScript — don't copy-paste.

## Practice / Project Wiki

Before you start coding, fill in a project wiki covering:

- **Links** — useful references such as local storage docs, jQuery good parts, top jQuery functions, chart libraries, star-rating widgets, smooth scrolling, sticky tables, and loaders you plan to use.
- **Draw** — a MockFlow wireframe of every screen in your game.
- **Resources** — icon fonts, placeholder photos (unsplash/pexels) you plan to use.
- **Array of objects** — sketch out the exact shape of the data structure your game will be built on (see the \`questions\`/\`blocks\` examples above) before writing any UI code — this is the single most important planning step for these projects.`,
          },
        ],
        resources: [
          {
            title: "MDN — HTML basics",
            description: "Structuring content with HTML.",
            url: "https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 60,
            topic: "HTML",
          },
          {
            title: "MDN — CSS first steps",
            description: "Getting started with CSS.",
            url: "https://developer.mozilla.org/en-US/docs/Learn/CSS/First_steps",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 60,
            topic: "CSS Introduction",
          },
          {
            title: "MDN — CSS layout",
            description: "Flexbox, Grid and page layout techniques.",
            url: "https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 60,
            topic: "CSS Part-2 Page Layouts",
          },
          {
            title: "MDN — Introduction to the DOM",
            description: "Reading and manipulating the DOM.",
            url: "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 45,
            topic: "DOM Manipulation",
          },
          {
            title: "jQuery Documentation",
            description: "Official jQuery API documentation.",
            url: "https://api.jquery.com/",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 30,
            topic: "JQuery",
          },
          {
            title: "MDN — Positioning",
            description: "A deeper walkthrough of static/relative/absolute/fixed/sticky positioning.",
            url: "https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Positioning",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 45,
            topic: "CSS Part-3 Position",
          },
          {
            title: "MDN — Media queries",
            description: "Writing responsive breakpoints with @media.",
            url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 30,
            topic: "CSS Part-3 Position",
          },
          {
            title: "Refactoring UI — practical design tips",
            description: "Practical, code-adjacent design tips on contrast, spacing, hierarchy and color.",
            url: "https://www.refactoringui.com/",
            type: DOC,
            isRequired: false,
            estimatedMinutes: 30,
            topic: "Design Fundamentals",
          },
          {
            title: "WebAIM — Contrast Checker",
            description: "Check a color pairing against WCAG contrast guidelines.",
            url: "https://webaim.org/resources/contrastchecker/",
            type: DOC,
            isRequired: false,
            estimatedMinutes: 10,
            topic: "Design Fundamentals",
          },
          {
            title: "Moqups — Wireframing Tool",
            description: "Sketch out a project's layout before writing any code.",
            url: "https://moqups.com/",
            type: DOC,
            isRequired: false,
            estimatedMinutes: 20,
            topic: "How To Start A Project",
          },
          {
            title: "MDN — Using the Web Storage API",
            description: "How to persist data with localStorage — useful for Project 1's stretch goals.",
            url: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API",
            type: DOC,
            isRequired: false,
            estimatedMinutes: 20,
            topic: "Project 1",
          },
          {
            title: "Netlify — Deploy a static site",
            description: "Free hosting for a static/vanilla-JS site, used for Project 1's stretch goals.",
            url: "https://docs.netlify.com/",
            type: DOC,
            isRequired: false,
            estimatedMinutes: 20,
            topic: "Project 1",
          },
        ],
        tasks: [
          {
            code: "WEB-001",
            title: "jQuery DOM Practice",
            description: "Rebuild a small piece of DOM-manipulation UI using jQuery instead of vanilla JS.",
            type: TaskType.CODING,
            priority: TaskPriority.LOW,
            difficulty: TaskDifficulty.EASY,
            points: 6,
            estimatedHours: 1,
            instructions: "Build a simple to-do list (add/remove/toggle-complete items) using only jQuery for DOM manipulation and events.",
            acceptanceCriteria: ["No vanilla querySelector/addEventListener used — jQuery only", "Pushed to GitHub"],
          },
          {
            code: "PROJ-1",
            title: "Project 1",
            description: "Your first solo project.",
            type: TaskType.PROJECT,
            priority: TaskPriority.HIGH,
            difficulty: TaskDifficulty.MEDIUM,
            points: 25,
            estimatedHours: 10,
            instructions:
              "Build a static, multi-page site with plain HTML, CSS and vanilla JavaScript DOM manipulation — no frameworks. Plan it out in a short wiki before you start building.",
            acceptanceCriteria: [
              "At least 3 distinct pages/views with working navigation",
              "Uses DOM manipulation for at least one interactive feature",
              "A short project wiki/README describing the plan and features",
            ],
            isWeeklyProject: true,
          },
        ],
        researchQuestions: [],
        weeklyProjectTitle: "Project 1",
        weeklyProjectDescription:
          "Your first solo project: a static, multi-page site built with plain HTML, CSS and vanilla JavaScript DOM manipulation — no frameworks. Plan it out in a short wiki before you start building.",
        submissionRequirements: ["Public GitHub repository URL", "Project wiki/README describing the plan and features", "Live demo URL (optional)"],
      },
      {
        weekNumber: 4,
        title: "Project 2",
        description: "A second, more ambitious frontend project applying everything from this phase.",
        objectives: ["Independently plan and scope a small frontend application", "Apply HTML/CSS/JS and DOM skills without step-by-step guidance"],
        topics: [
          {
            title: "Project 2",
            content: `## High-Level Goals

The goal of this project is to practice individually creating a dynamic website using what you have learned so far.

## Project Requirements

Project requirements must be met (minimum requirements):

- Create a wireframe describing the project idea (Moqups or MockFlow).
- Must have separate files for HTML, CSS, and JS.
- Must use CSS Grid or Flexbox to create the page layout.
- HTML, CSS, JS (ES6), and jQuery must be used in the project.
- Must use local storage to persist data after refresh (if applicable).
- The website must be dynamic.
- Must be a single-page application (show/hide instead of opening a new HTML page).
- Write clean code with good style (use a Prettier extension).
- Push the code frequently, every hour (should not be less than 35 commits total).
- The code must be presented on your personal GitHub account as a repo called \`MERAKI_Academy_Project_2\`.
- Project must be ready before the deadline.
- The video must be uploaded on time.

## Project Idea

The project idea will be left for you to decide — keep the following in mind while deciding:

- The idea should meet the minimum project requirements.
- The idea should be big enough to work on for the whole project duration, and still have advanced features to work on in the future.
- Don't be afraid to have creative ideas — if you're not sure how it could be implemented, ask for help.

If you're not sure what your idea is, here's a list for inspiration:

- Todo List App
- Photo Gallery
- Book Store
- Movies App
- Food Recipes
- Social Media Platform
- E-Commerce Website
- Expense Tracker

## Project Stretch Goals

- Deploy the website using Netlify.
- Login & register functionality.
- Fully responsive design for both mobile and desktop (CSS media queries).
- Use CSS custom properties.
- Change the website color theme (dark / light).
- Fetching data from an API.
- Class-based OOP.

## User Story Examples

**Todo List**
- User should be able to add a new to-do item to the list.
- User should be able to modify or delete any added item.
- User should be able to view all added items.
- Items should be categorized as completed / pending.

**Book Store**
- User should be able to view multiple book items (title, description, price).
- User should be able to add or remove any book from the shopping cart.
- User should not lose the added items after refreshing (local storage).
- User can check out and view the total price for the added items.

**Expense Tracker**
- User should be able to enter income and expenses.
- User should choose the tracking duration (monthly / weekly).
- User should be able to see the expected amount of savings for each duration.

## Project Wiki

Before you start coding, fill in a project wiki covering the same sections as Project 1 (links, wireframes, resources), plus the shape of your data:

~~~js
// example: array of objects for a Book Store project
const books = [
  {
    id: 1,
    title: "about book",
    author: "the author",
    imageSrc: "src/path",
    description: "some description about book and author",
    rate: 4,
    price: 22,
  },
  // {}...
];
~~~

Useful reference APIs, depending on your idea: a Products API, a Movie API, a Books API, a Weather API, a Currency Exchange API, a Food/Recipes API, and Unsplash/Pexels for placeholder photos.

## Practice

Before starting Project 2, write a short project plan covering:

1. Your chosen project idea and why it's big enough to fill the whole project duration.
2. A wireframe/sketch of every screen (remember: single-page application, screens are shown/hidden, not separate HTML pages).
3. The array-of-objects data shape your app will be built on.
4. Your GitHub repository, created and cloned, with an initial commit already pushed.`,
          },
        ],
        resources: [
          {
            title: "Moqups — Wireframing Tool",
            description: "Sketch out every screen of your project before writing code.",
            url: "https://moqups.com/",
            type: DOC,
            isRequired: false,
            estimatedMinutes: 20,
            topic: "Project 2",
          },
          {
            title: "Netlify — Deploy a static site",
            description: "Free hosting for a static/vanilla-JS site, used for the stretch goal.",
            url: "https://docs.netlify.com/",
            type: DOC,
            isRequired: false,
            estimatedMinutes: 20,
            topic: "Project 2",
          },
        ],
        tasks: [
          {
            code: "PROJ-2",
            title: "Project 2",
            description: "A second, more ambitious solo frontend project.",
            type: TaskType.PROJECT,
            priority: TaskPriority.HIGH,
            difficulty: TaskDifficulty.MEDIUM,
            points: 25,
            estimatedHours: 12,
            instructions:
              "Independently plan and build a small frontend application, applying everything from Phase 1 (HTML/CSS/JS/DOM). Write a short wiki plan before you start.",
            acceptanceCriteria: [
              "Built independently from a short wiki plan",
              "Demonstrates DOM manipulation, event handling and a clear visual design",
              "Pushed to a public GitHub repository",
            ],
            isWeeklyProject: true,
          },
        ],
        researchQuestions: [],
        weeklyProjectTitle: "Project 2",
        weeklyProjectDescription:
          "A second solo frontend project, built independently from a short wiki plan — the capstone for Phase 1.",
        submissionRequirements: ["Public GitHub repository URL", "Project wiki/README", "Live demo URL (optional)"],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // Phase 2 — Backend & React Development (Weeks 5–8)
  // ─────────────────────────────────────────────────────────────────────
  {
    phaseNumber: 2,
    title: "Backend & React Development",
    description: "Node/Express APIs, authentication, and building real UIs with React.",
    weeks: [
      {
        weekNumber: 5,
        title: "Backend Development & Express.js",
        description: "What a backend does, building REST APIs, asynchronous JavaScript, and Express middleware.",
        objectives: [
          "Explain what a backend server does and how clients talk to it",
          "Design a basic REST API",
          "Use async/await and handle asynchronous errors",
          "Build routes and controllers with Express, and write custom middleware",
        ],
        topics: [
          { title: "Backend Development", content: "" },
          { title: "APIs", content: "" },
          { title: "Asynchronous Programming", content: "" },
          { title: "Express Middlewares", content: "" },
        ],
        resources: [
          {
            title: "Node.js Documentation",
            description: "Official Node.js API documentation.",
            url: "https://nodejs.org/en/docs",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 45,
            topic: "Backend Development",
          },
          {
            title: "MDN — Using Promises",
            description: "How Promises and async/await work.",
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 45,
            topic: "Asynchronous Programming",
          },
          {
            title: "Express Documentation",
            description: "Official Express.js guide and API reference.",
            url: "https://expressjs.com/en/guide/routing.html",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 60,
            topic: "Express Middlewares",
          },
        ],
        tasks: [
          {
            code: "NODE-001",
            title: "Async JS & Fetch Practice",
            description: "Fetch data asynchronously and handle failure paths.",
            type: TaskType.CODING,
            priority: TaskPriority.MEDIUM,
            difficulty: TaskDifficulty.MEDIUM,
            points: 10,
            estimatedHours: 1.5,
            instructions: "Write an async function that fetches from a public JSON API with proper try/catch error handling and a request timeout.",
            acceptanceCriteria: ["Handles network failure without crashing", "Uses async/await, not raw .then chains"],
          },
          {
            code: "NODE-002",
            title: "Express Middleware Practice",
            description: "Write custom Express middleware.",
            type: TaskType.CODING,
            priority: TaskPriority.MEDIUM,
            difficulty: TaskDifficulty.MEDIUM,
            points: 10,
            estimatedHours: 1.5,
            instructions:
              "Build a small Express API with a request-logging middleware and an error-handling middleware. Follow Route → Controller → Service layering.",
            acceptanceCriteria: ["Logging middleware runs on every request", "Errors are caught by a dedicated error-handling middleware, not left to crash the process"],
          },
        ],
        researchQuestions: ["What is the JavaScript event loop, and why does it matter for a Node.js server?"],
        submissionRequirements: ["Public GitHub repository URL"],
      },
      {
        weekNumber: 6,
        title: "Authentication, Authorization & Project 3",
        description: "Securing an API with authentication and authorization, applied in a three-part project.",
        objectives: ["Implement password hashing and login with JWT", "Restrict routes by role"],
        topics: [{ title: "Authentication And Authorization", content: "" }],
        resources: [
          {
            title: "OWASP — Authentication Cheat Sheet",
            description: "Best practices for implementing authentication securely.",
            url: "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 30,
            topic: "Authentication And Authorization",
          },
        ],
        tasks: [
          {
            code: "PROJ-3",
            title: "Project 3 (Part 1, 2, 3)",
            description: "A three-part backend project: REST API, then auth, then role-based authorization.",
            type: TaskType.PROJECT,
            priority: TaskPriority.URGENT,
            difficulty: TaskDifficulty.HARD,
            points: 30,
            estimatedHours: 14,
            instructions:
              "Part 1: build a REST API with proper Route → Controller → Service layering. Part 2: add authentication (password hashing + JWT). Part 3: add role-based authorization to protect specific routes.",
            acceptanceCriteria: [
              "All three parts are implemented and working end-to-end",
              "Passwords are hashed, never stored or returned in plaintext",
              "At least one route is protected by role, verified server-side",
            ],
            isWeeklyProject: true,
          },
        ],
        researchQuestions: ["Authentication vs Authorization — what's the difference?"],
        weeklyProjectTitle: "Project 3",
        weeklyProjectDescription:
          "A three-part backend project (Part 1, 2, 3): build a REST API, then add authentication, then add role-based authorization — following Route → Controller → Service architecture throughout.",
        submissionRequirements: ["Public GitHub repository URL", "Pull request URL", ".env.example included (no real secrets)"],
      },
      {
        weekNumber: 7,
        title: "React Fundamentals",
        description: "Building UIs with React: components, hooks, and context.",
        objectives: ["Build components with props and state", "Use useState/useEffect correctly", "Share state across components with Context"],
        topics: [
          { title: "React Intro", content: "" },
          { title: "React Hooks", content: "" },
          { title: "React Context", content: "" },
        ],
        resources: [
          {
            title: "React Documentation",
            description: "The official React documentation.",
            url: "https://react.dev/learn",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 120,
            topic: "React Intro",
          },
        ],
        tasks: [
          {
            code: "REACT-001",
            title: "React Hooks Practice",
            description: "Practice useState/useEffect with a small data-driven component.",
            type: TaskType.CODING,
            priority: TaskPriority.MEDIUM,
            difficulty: TaskDifficulty.MEDIUM,
            points: 10,
            estimatedHours: 2,
            instructions: "Build a component that fetches a list from a public API in useEffect and shows loading/error/success states with useState.",
            acceptanceCriteria: ["Loading, error and success states are all visibly distinct", "Cleans up correctly if the component unmounts mid-fetch"],
          },
        ],
        researchQuestions: ["When should useEffect be used, and when should it be avoided?"],
        submissionRequirements: ["Public GitHub repository URL"],
      },
      {
        weekNumber: 8,
        title: "React Router, Redux & Project 4",
        description: "Client-side routing and global state management, applied in a solo project.",
        objectives: ["Set up multi-page navigation with React Router", "Manage global state with Redux"],
        topics: [
          { title: "React Router", content: "" },
          { title: "Redux", content: "" },
        ],
        resources: [
          {
            title: "React Router Documentation",
            description: "Official docs for React Router.",
            url: "https://reactrouter.com/en/main",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 60,
            topic: "React Router",
          },
          {
            title: "Redux Documentation",
            description: "Official Redux documentation.",
            url: "https://redux.js.org/",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 60,
            topic: "Redux",
          },
        ],
        tasks: [
          {
            code: "PROJ-4",
            title: "Project 4 (Solo)",
            description: "A solo React application with routing and Redux.",
            type: TaskType.PROJECT,
            priority: TaskPriority.HIGH,
            difficulty: TaskDifficulty.HARD,
            points: 30,
            estimatedHours: 15,
            instructions:
              "Build a full React application with multi-page routing (React Router) and global state managed with Redux. Write a short wiki plan before you start.",
            acceptanceCriteria: [
              "At least 3 routed pages with working navigation",
              "Global state is managed with Redux, not just local component state",
              "A short project wiki/README describing the plan and features",
            ],
            isWeeklyProject: true,
          },
        ],
        researchQuestions: ["Redux vs React Context — when would you reach for one over the other?"],
        weeklyProjectTitle: "Project 4 (Solo)",
        weeklyProjectDescription:
          "A solo full React application with multi-page routing (React Router) and global state managed with Redux — the capstone for Phase 2.",
        submissionRequirements: ["Public GitHub repository URL", "Project wiki/README", "Live demo URL (optional)"],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // Phase 3 — Databases, TypeScript & Team Projects (Weeks 9–12)
  // ─────────────────────────────────────────────────────────────────────
  {
    phaseNumber: 3,
    title: "Databases, TypeScript & Team Projects",
    description: "Relational databases, TypeScript, Next.js, working as a team on GitHub, and data structures & algorithms.",
    weeks: [
      {
        weekNumber: 9,
        title: "PostgreSQL & Relational Databases",
        description: "Relational database design and SQL.",
        objectives: ["Design normalized relational tables", "Write SQL queries: CRUD, filtering, joins, aggregation"],
        topics: [
          { title: "PostgreSQL", content: "" },
          { title: "Relational_Databases", content: "" },
        ],
        resources: [
          {
            title: "PostgreSQL Documentation",
            description: "Official PostgreSQL manual.",
            url: "https://www.postgresql.org/docs/current/",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 90,
            topic: "PostgreSQL",
          },
        ],
        tasks: [
          {
            code: "SQL-001",
            title: "SQL Queries Practice",
            description: "Practice core SQL against a small relational schema.",
            type: TaskType.CODING,
            priority: TaskPriority.MEDIUM,
            difficulty: TaskDifficulty.MEDIUM,
            points: 10,
            estimatedHours: 1.5,
            instructions: "Design `users` and `posts` tables, then write queries covering WHERE/ORDER BY/LIMIT, an aggregate with GROUP BY, and a JOIN across both tables.",
            acceptanceCriteria: ["Tables have appropriate primary/foreign keys", "All required query types are included and run successfully"],
          },
        ],
        researchQuestions: ["INNER JOIN vs LEFT JOIN — what's the difference, with an example?"],
        submissionRequirements: ["Public GitHub repository URL with .sql files"],
      },
      {
        weekNumber: 10,
        title: "TypeScript & Next.js",
        description: "Adding static types with TypeScript, and building full-stack React apps with Next.js.",
        objectives: [
          "Use TypeScript's core type system (interfaces, unions, generics)",
          "Build pages and API routes with Next.js",
        ],
        topics: [
          { title: "TypeScript", content: "" },
          { title: "Next.js Intro", content: "" },
          { title: "Next-API", content: "" },
        ],
        resources: [
          {
            title: "TypeScript Handbook",
            description: "The official TypeScript language handbook.",
            url: "https://www.typescriptlang.org/docs/handbook/intro.html",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 90,
            topic: "TypeScript",
          },
          {
            title: "Next.js Documentation",
            description: "Official Next.js documentation.",
            url: "https://nextjs.org/docs",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 60,
            topic: "Next.js Intro",
          },
        ],
        tasks: [
          {
            code: "TS-001",
            title: "TypeScript & Next.js Practice",
            description: "Convert a small module to TypeScript and build a Next.js API route.",
            type: TaskType.CODING,
            priority: TaskPriority.MEDIUM,
            difficulty: TaskDifficulty.MEDIUM,
            points: 10,
            estimatedHours: 2,
            instructions:
              "Type a small existing JS module (no `any`), then build a Next.js page that calls a Next.js API route (app/pages router, either is fine) and renders the typed response.",
            acceptanceCriteria: ["Compiles with strict mode, no errors", "The API route and the page both have proper TypeScript types"],
          },
        ],
        researchQuestions: [],
        submissionRequirements: ["Public GitHub repository URL"],
      },
      {
        weekNumber: 11,
        title: "Team Collaboration & Project 5",
        description: "Working as a team on GitHub, culminating in a team project.",
        objectives: ["Collaborate on GitHub using teams, branches and pull request review", "Deliver a project as part of a team"],
        topics: [{ title: "GitHub Teams", content: "" }],
        resources: [
          {
            title: "GitHub Docs — About teams",
            description: "How GitHub Teams work for collaboration.",
            url: "https://docs.github.com/en/organizations/organizing-members-into-teams/about-teams",
            type: DOC,
            isRequired: true,
            estimatedMinutes: 20,
            topic: "GitHub Teams",
          },
        ],
        tasks: [
          {
            code: "PROJ-5",
            title: "Project 5 (Team)",
            description: "A team project built and reviewed together on GitHub.",
            type: TaskType.PROJECT,
            priority: TaskPriority.URGENT,
            difficulty: TaskDifficulty.HARD,
            points: 30,
            estimatedHours: 16,
            instructions:
              "As a GitHub team, plan the project together in a shared wiki, split work across feature branches, and merge through reviewed pull requests.",
            acceptanceCriteria: [
              "A shared project wiki documenting the plan and each member's part",
              "Work was done on feature branches merged via reviewed pull requests, not directly to main",
              "The submitted repository URL is the shared team repository",
            ],
            isWeeklyProject: true,
          },
        ],
        researchQuestions: ["What makes code review effective on a team, beyond just checking for bugs?"],
        weeklyProjectTitle: "Project 5 (Team)",
        weeklyProjectDescription:
          "A team project: plan together in a shared wiki, split work across feature branches, and merge through reviewed pull requests as a GitHub team.",
        submissionRequirements: ["Public GitHub repository URL (team repo)", "Project wiki/README", "Pull request URL(s)"],
      },
      {
        weekNumber: 12,
        title: "Data Structures & Algorithms",
        description: "Core data structures and how to reason about algorithmic efficiency.",
        objectives: [
          "Implement and reason about the trade-offs of stacks, queues, linked lists and trees",
          "Analyze the time complexity of an algorithm",
        ],
        topics: [
          { title: "Time Complexity", content: "" },
          { title: "Stack Data Structure", content: "" },
          { title: "Queue Data Structure", content: "" },
          { title: "Linked List Data Structure", content: "" },
          { title: "Tree Data Structure", content: "" },
        ],
        resources: [
          {
            title: "MDN — Big O notation primer",
            description: "A practical introduction to algorithmic complexity.",
            url: "https://developer.mozilla.org/en-US/docs/Glossary/Big_O_notation",
            type: DOC,
            isRequired: false,
            estimatedMinutes: 20,
            topic: "Time Complexity",
          },
        ],
        tasks: [
          {
            code: "DS-001",
            title: "Implement a Stack",
            description: "Build a stack from scratch.",
            type: TaskType.PROBLEM_SOLVING,
            priority: TaskPriority.MEDIUM,
            difficulty: TaskDifficulty.EASY,
            points: 6,
            estimatedHours: 1,
            instructions: "Implement a Stack class with push, pop, peek and isEmpty, backed by a plain array (do not use a library).",
            acceptanceCriteria: ["pop()/peek() on an empty stack is handled explicitly (no silent crash)", "Solution pushed to GitHub"],
          },
          {
            code: "DS-002",
            title: "Implement a Queue",
            description: "Build a queue from scratch.",
            type: TaskType.PROBLEM_SOLVING,
            priority: TaskPriority.MEDIUM,
            difficulty: TaskDifficulty.EASY,
            points: 6,
            estimatedHours: 1,
            instructions: "Implement a Queue class with enqueue, dequeue, front and isEmpty.",
            acceptanceCriteria: ["dequeue() on an empty queue is handled explicitly", "Solution pushed to GitHub"],
          },
          {
            code: "DS-003",
            title: "Implement a Linked List",
            description: "Build a singly linked list from scratch.",
            type: TaskType.PROBLEM_SOLVING,
            priority: TaskPriority.MEDIUM,
            difficulty: TaskDifficulty.MEDIUM,
            points: 8,
            estimatedHours: 1.5,
            instructions: "Implement a singly linked list with insert (head/tail), delete and search/traverse.",
            acceptanceCriteria: ["Handles deleting the head node correctly", "Solution pushed to GitHub"],
          },
          {
            code: "DS-004",
            title: "Implement a Binary Tree",
            description: "Build a binary search tree from scratch.",
            type: TaskType.PROBLEM_SOLVING,
            priority: TaskPriority.MEDIUM,
            difficulty: TaskDifficulty.HARD,
            points: 10,
            estimatedHours: 2,
            instructions: "Implement a binary search tree with insert, search, and an in-order traversal.",
            acceptanceCriteria: ["In-order traversal returns values in sorted order", "Solution pushed to GitHub"],
          },
          {
            code: "DS-005",
            title: "Time Complexity Analysis",
            description: "Analyze the Big-O of your own implementations.",
            type: TaskType.RESEARCH,
            priority: TaskPriority.LOW,
            difficulty: TaskDifficulty.MEDIUM,
            points: 6,
            estimatedHours: 1,
            instructions: "For each of your Stack, Queue, Linked List and Tree implementations, write down the time complexity of each operation and justify it in a README.",
            acceptanceCriteria: ["Every public method has a stated Big-O with a one-line justification"],
          },
        ],
        researchQuestions: ["Why is a hash map's average-case lookup O(1), and when does it degrade?"],
        submissionRequirements: ["Public GitHub repository URL"],
      },
    ],
  },
];
