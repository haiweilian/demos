// fn main() {
//     let s1 = String::from("hello");

//     let len = calculate_length(&s1); // &s1 借用

//     println!("The length of '{}' is {}.", s1, len);
// }

// fn calculate_length(s: &String) -> usize { // s 是对 String 的引用
//     s.len()
// } // 这里，s 离开了作用域。但因为它并不拥有引用值的所有权，
//   // 所以什么也不会发生

// fn main() {
//     // 都加上 mut 变为可变引用
//     let mut s = String::from("hello");

//     change(&mut s); // 可变引用
// }

// fn change(some_string: &mut String) {
//     some_string.push_str(", world");
// }


fn main() {
    let mut s = String::from("hello");

    let s1 = &s; // 借用
    let s2 = &s; // 借用
    println!("{}, {}", s1, s2); // 借用完毕，此处释放了

    let s3 = &mut s; // 可变引用
    s3.push_str(", world!");
    println!("{}", s3); // 借用完毕，此处释放了
}
