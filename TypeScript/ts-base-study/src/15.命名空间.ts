/// <reference path="15/Validation.ts" />
/// <reference path="15/LettersOnlyValidator.ts" />
/// <reference path="15/ZipCodeValidator.ts" />
/// <reference path="15/Shapes.ts" />

// --使用命名空间的方式是用 namespace 定义 使用 reference 导入
// --通过reference进行导入相当于xxx.ts文件内的命名空间和当前文件进行了合并:
// Some samples to try
let strings = ["Hello", "98052", "101"];

// Validators to use
let validators: { [s: string]: Validation.StringValidator } = {};
validators["ZIP code"] = new Validation.ZipCodeValidator();
validators["Letters only"] = new Validation.LettersOnlyValidator();

// Show whether each string passed each validator
for (let s of strings) {
  for (let name in validators) {
    console.log(`"${s}" - ${validators[name].isAcceptable(s) ? "matches" : "does not match"} ${name}`);
  }
}

let polygons = Shapes.Polygons;
new polygons.Square();
