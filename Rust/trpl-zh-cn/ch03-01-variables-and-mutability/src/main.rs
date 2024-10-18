// 不可变
// fn main() {
//     let x = 5;
//     println!("The value of x is: {}", x);
//     x = 6;
//     println!("The value of x is: {}", x);
// }

// 使用 mut 变为可变
// fn main() {
//     let mut x = 5;
//     println!("The value of x is: {}", x);
//     x = 6;
//     println!("The value of x is: {}", x);
// }

// const 定义常量并且不可变，需要手动指定类型
// fn main() {
//     const THREE_HOURS_IN_SECONDS: u32 = 60 * 60 * 3;
//     println!("The value is: {}", THREE_HOURS_IN_SECONDS);
// }

fn main() {
    let x: u32 = 5;

    // 遮蔽 x 值
    let x: u32 = x + 1;

    // 作用域范围，当内部遮蔽执行结束后，会恢复成之前的值。
    // 可以理解为不会遮蔽?
    {
        let x: u32 = x * 2;
        println!("This is value {}", x)
    }

    println!("This is value {}", x)
}
