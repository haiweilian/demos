mod main2;
mod main3;

// 编辑自动补充生命周期参数规则：

// 第一条规则是编译器为每一个引用参数都分配一个生命周期参数。
// 换句话说就是，函数有一个引用参数的就有一个生命周期参数：fn foo<'a>(x: &'a i32)，有两个引用参数的函数就有两个不同的生命周期参数，fn foo<'a, 'b>(x: &'a i32, y: &'b i32)，依此类推。

// 第二条规则是如果只有一个输入生命周期参数
// 那么它被赋予所有输出生命周期参数：fn foo<'a>(x: &'a i32) -> &'a i32。

// 第三条规则是如果方法有多个输入生命周期参数并且其中一个参数是 &self 或 &mut self，
// 说明是个对象的方法 (method)(译者注：这里涉及 rust 的面向对象参见 17 章)，那么所有输出生命周期参数被赋予 self 的生命周期。第三条规则使得方法更容易读写，因为只需更少的符号。

// fn main() {
//     let string1 = String::from("abcd");
//     let string2 = "xyz";

//     let result = longest(string1.as_str(), string2);
//     println!("The longest string is {result}");
// }

// fn main() {
//     let string1 = String::from("long string is long");

//     {
//         let string2 = String::from("xyz");
//         let result = longest(string1.as_str(), string2.as_str());
//         println!("The longest string is {result}");
//     }
// }

// fn main() {
//     let string1 = String::from("long string is long");
//     let string2 = String::from("xyz");
//     let result;
//     {
//         result = longest(string1.as_str(), string2.as_str());
//     }
//     println!("The longest string is {result}");
// }

fn main() {
    let string1 = String::from("long string is long");
    let result;
    {
        let string2 = String::from("xyz");
        // 错误因为 longest 返回的引用值的生命周期比最短的要长
        // 因为 result 周期到打印，而 string2 只到这里
        result = longest(string1.as_str(), string2.as_str());
    }
    println!("The longest string is {result}");
}

// 编译器不知道返回 x 还是 y，所以不知道返回的引用是否还有效。
// fn longest(x: &str, y: &str) -> &str {
//     if x.len() > y.len() {
//         x
//     } else {
//         y
//     }
// }

// 所以我们通过 生命周期注释 告诉编译器，函数参数和返回的引用的生成周期一样长。
// 它的实际含义是 longest 函数返回的引用的生命周期与函数参数所引用的值的生命周期的较小者一致。
// 命周期语法是用于将函数的多个参数与其返回值的生命周期进行关联的
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
