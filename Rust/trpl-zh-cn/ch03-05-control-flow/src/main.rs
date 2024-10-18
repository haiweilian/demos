// 判断
// fn main() {
//     let number = 3;

//     if number < 5 {
//         println!("condition was true");
//     } else {
//         println!("condition was false");
//     }

//     // if 能判断 bool 值，需要比较
//     // if n {}
//     if number != 0 {
//         println!("number was something other than zero");
//     }

//     // 多条件判断
//     if number % 4 == 0 {
//         println!("number is divisible by 4");
//     } else if number % 3 == 0 {
//         println!("number is divisible by 3");
//     } else if number % 2 == 0 {
//         println!("number is divisible by 2");
//     } else {
//         println!("number is not divisible by 4, 3, or 2");
//     }
// }

// loop 循环
// fn main () {
//     loop {
//         println!("loop")
//     }
// }

// loop 嵌套循环
// fn  main() {
//     let mut count = 0;

//     // 外层的循环起个名字
//     'counting_up: loop {
//         println!("count = {}", count);
//         let mut remaining = 10;

//         loop {
//             println!("remaining = {}", remaining);

//             if remaining == 9 {
//                 break;  // 结束内部的循环
//             }

//             if count == 2 {
//                 break 'counting_up; // 结束外部的循环
//             }

//             remaining -= 1;
//         }

//         count += 1;
//     }
// }

// loop 循环返回
// fn main() {
//     let mut count = 0;

//     let result = loop {
//         count += 1;

//         if count == 10 {
//             break count * 2; // break 后跟的值作为返回值
//         }
//     };

//     println!("result {}", result);
// }


// while 循环
// fn main() {
//     let mut number = 3;

//     while number != 0 {
//         println!("number {}",  number);
//         number -= 1;
//     }
// }


// for 循环
fn main() {
    let a = [1, 2, 3, 4, 5, 6, 7];

    for item in a {
        println!("item {}", item)
    }
}
