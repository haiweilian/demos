// 数字
// fn main() {
//     let n1: u32 = 1;
//     // let n1: u32 = -1;
//     let n2: i32 = -1;
//     // let n3: u8 = 12323;
//     let f1: f64 = 1.0;
//     // let f1: f32 = 1;

//     // addition
//     let sum = 5 + 10;

//     // subtraction
//     let difference = 95.5 - 4.3;

//     // multiplication
//     let product = 4 * 30;

//     // division
//     let quotient = 56.7 / 32.2;
//     let floored = 2 / 3; // Results in 0

//     // remainder
//     let remainder = 43 % 5;
// }

// 布尔
// fn main() {
//     let t = true;
//     let f: bool = false;
// }

// 字符
// fn main() {
//     let s1 = 'z';
//     let s2: char = '中';
//     let heart_eyed_cat: char = '😻';
// }

// 复合类型
fn main() {
    let tup: (i32, f64, &str) = (100, 100.00, "100.00");
    let (x, y, z) = tup;
    let x1 = tup.0;
    let y1 = tup.1;
    let z1 = tup.2;

    let a = [1, 2, 3, 4, 5, 6];
    let a0 = a[0];
    let a1 = a[1];
}
