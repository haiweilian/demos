function makeKing(name = "Henry", numerals = name) {
  return `King ${name} ${numerals}`;
}

console.log(makeKing()); // King Henry Henry

function makeKing(numerals = name, name = "Henry") {
  return `King ${name} ${numerals}`;
}

console.log(makeKing()); // ReferenceError: Cannot access 'name' before initialization
