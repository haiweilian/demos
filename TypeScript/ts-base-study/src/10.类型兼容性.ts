// ====== 基础 [子类型、逆变、协变]
// 如果`x`要兼容`y`，那么`y`至少具有与`x`相同的属性
// X（目标类型） = Y（源类型），X 兼容 Y
interface Named {
  name: string;
}

let x: Named;
let y = { name: "Alice", location: "China" };

// -- 属性少的兼容属性多的
x = y;
// y = x;

// ===== 比较两个函数
let xfn = (a: number) => 0;
let yfn = (b: number, c: number) => 0;
// --参数多的兼容参数少的
yfn = xfn;
// xfn = yfn;
