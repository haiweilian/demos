// fn main() {
//     // let v: Vec<i32> = Vec::new();

//     // let v: Vec<i32> = vec![1, 2, 3];

//     // let mut v: Vec<i32> = Vec::new();
//     // v.push(1);
//     // v.push(2);

//     let v: Vec<i32> = vec![1, 2, 3, 4, 5];
//     let third: &i32 = &v[2]; // 通过索引获取
//     println!("The third element is {third}");

//     // 通过 get 获取可能为 none
//     let third: &Option<&i32> = &v.get(2);
//     match third {
//         Some(third) => println!("The third element is {third}"),
//         None => println!("There is no third element."),
//     }
// }

// fn main() {
//     let v = vec![1, 2, 3, 4, 5];
//     let third = &v[2];
//     // v.push(v); // 不能添加，被借用后不能修改，因为地址会变化

//     for i in &v {
//         println!("{i}")
//     }
// }


// fn main() {
//     let mut v = vec![1, 2, 3];
//     for i in &mut v {
//         *i += 50;
//     }
// }

enum SpreadsheetCell {
    Int(i32),
    Float(f64),
    Text(String),
}

fn main() {
    let row: Vec<SpreadsheetCell> = vec![
        SpreadsheetCell::Int(3),
        SpreadsheetCell::Text(String::from("blue")),
        SpreadsheetCell::Float(10.12),
    ];
}
