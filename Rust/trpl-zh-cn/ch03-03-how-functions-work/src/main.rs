fn main() {
    println!("Hello, world!");
    another_function(5, 'h');

    let x = plus_one(5);
    println!("plus_one {}", x);

    let y = plus_two(5);
    println!("plus_two {}", y);
}

fn another_function(x: i32, u: char) {
    println!("another_function This is value {}{}", x, u)
}

// 函数有返回值必须指定类型 -> i32
fn plus_one(x: i32) -> i32 {
    x + 1 // 最后一行表达式不带 ; 分号，当成返回值
}

fn plus_two(y: i32) -> i32 {
    return y + 2; // 带 ; 好转为语句，使用 return 返回
}
