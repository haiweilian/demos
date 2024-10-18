// fn main() {
//    let s = String::from("hello");

//    let s1 = &s[0..2];
//    let s2 = &s[..2];
//    let s3 = &s[0..];
//    let s4 = &s[..];

//    println!("{},{},{},{}", s1, s2, s3, s4);
// }

fn main() {
    let s = String::from("hello world!");
    let f1 = first_word(&s);
    println!("first_word, {}", f1);
    println!("first_word, {}", first_word("haiwei lian"));
}

fn first_word(s: &str) -> &str {
    for (index, &item) in s.as_bytes().iter().enumerate() {
        if item == b' ' {
            return &s[0..index];
        }
    }
    &s[..]
}
