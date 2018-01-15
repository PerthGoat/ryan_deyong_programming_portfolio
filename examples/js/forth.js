console.log('FORTHJS LOADED');

var line = "";
var dict = ["DUB", "DUBDUB"];
var dictslave = ["2 *", "DUB DUB"];

var param = []; // parameter stack

var memory = []; // random access memory
var IP = 0;

// checks if something is a number
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

// tries to execute primitive words
function primitive(w) {
  switch(w) {
    case "+": // adds the two numbers atop the stack
      var n1 = param.pop();
      var n2 = param.pop();
      param.push(n1 + n2);
    break;
    case "*": // multiplies the 2 numbers atop the stasck
      var n1 = param.pop();
      var n2 = param.pop();
      param.push(n1 * n2);
    break;
    case "-": // subtracts the 2 numbers atop the stack
      var n1 = param.pop();
      var n2 = param.pop();
      param.push(n2 - n1);
    break;
    case "/": // divides the 2 numbers atop the stack
      var n1 = param.pop();
      var n2 = param.pop();
      param.push(n2 / n1);
    break;
    case ".": // outputs the number atop the stack
      //console.log(param.pop());
      document.getElementById("out").value = param.pop();
    break;
    case "!": // stores a value in memory
      var addr = param.pop();
      var n = param.pop();
      
      memory[addr] = n;
    break;
    case "@": // retrieves a value from memory given an address
      var addr = param.pop();
      param.push(memory[addr]);
    break;
    case "EMIT": // emits a single character based on an ascii on stack
      var char = String.fromCharCode(param.pop());
      document.getElementById("out").value = char;
    break;
    
    // default for if we can't execute the primimtive passed
    default:
    return -1;
    break;
  }
  return 0;
}

// finds a word in the dictionary
function dictSearch(w) {
  for(var i = dict.length - 1;i >= 0;i--) {
    if(dict[i] == w) { // this may need to be more accurate later
      return dictslave[i];
    }
  }
  return "";
}

// interprets what it is passed
function interpret(s) {
  //console.log(s);
  if(dictSearch(s) != "") { // check if the word is in the dictionary, if so, recursively run it
    var w = dictSearch(s); // gets the word
    runForth(w); // runs it with the onboard interpreting function
  } else if(isNumber(s)) { // if we are looking at a number, push it onto the stack as a literal
    param.push(parseFloat(s));
  } else { // otherwise we're looking at a primitive, check them out and abort if invalid
    if(primitive(s) == -1) {
      document.getElementById("out").value = (s + " ?");
      return -1;
    }
  }
  return 0;
}

// adds a word from a word definition, ex.
// : SIX 3 2 * .
function addWord(s) {
  var sb = ""; // stringbuilder for parsing
  var name = ""; // holds the name of the word
  // start looping after the word definition
  for(var i = 2;i < s.length;i++) {
    if(name == "") {
      if(s[i] == " " || s[i] == "") {
      
        name = sb;
        sb = "";
        continue;
      } else {
        sb += s[i];
      }
    }
    if(name != "") {
      sb += s[i];
    }
  }
  // push the new word onto the dictionary
  dict.push(name);
  dictslave.push(sb);
  //console.log(name);
  //console.log(sb);
}

// runs a piece of forth code
function runForth(s) {
  var sb = ""; // stringbuilder for parsing
  for(var i = 0;i < s.length;i++) {
    if(s[i] == " " || s[i] == "") {
      if(interpret(sb) == -1) {
        break;
      }
      sb = "";
    } else {
      sb += s[i];
    }
  }
  interpret(sb);
}

// event handler for the button
document.getElementById("run").onclick = function() {
  //console.log("TEST");
  // runs the forth in the forth box
  line = document.getElementById("in").value;
  if(line[0] == ":") {
    addWord(line);
  } else {
    runForth(line);
  }
}