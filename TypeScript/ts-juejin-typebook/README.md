<https://juejin.cn/book/7047524421182947366>

## 动态类型与静态类型

动态类型是运行时检查的，所以会常出现 xx is not function

静态类型是编译时检查的，所以在开发阶段就能发现 xx is not function。(只是避免明显的错误，动态的不可避免。)

## TS 的类型为什么复杂。

TypeScript 的类型系统是图灵完备的，也就是能描述各种可计算逻辑。简单点来理解就是循环、条件等各种 JS 里面有的语法它都有，JS 能写的逻辑它都能写。

- 普通类型系统

- 泛型类型系统

- 可类型编程的类型系统(ts)

## 子类型、逆变、协变

类型之间是有父子关系的，更具体的那个是子类型，比如 A 和 B 的交叉类型 A & B 就是联合类型 A | B 的子类型，因为更具体。

如果允许父类型赋值给子类型，就叫做逆变。

如果允许子类型赋值给父类型，就叫做协变。

## 类型体操顺口溜

模式匹配做提取，重新构造做变换。

递归复用做循环，数组长度做计数。

联合分散可简化，特殊特性要记清。

基础扎实套路熟，类型体操可通关。
