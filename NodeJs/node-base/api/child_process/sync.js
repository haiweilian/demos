import { execSync, execFileSync, spawnSync } from "child_process";

let l1 = execSync("ls");

let l2 = execFileSync("ls");

let l3 = spawnSync("ls");

console.log(l1.toString());
console.log(l2.toString());
console.log(l3.stdout.toString());
