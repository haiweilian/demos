use std::collections::HashMap;

// fn main() {

//     let mut scores = HashMap::new();

//     scores.insert(String::from("Blue"), 10);
//     scores.insert(String::from("Blue"), 50);

//     let team_name = String::from("Blue");
//     let score = scores.get(&team_name).copied().unwrap_or(0);

//     println!("score {score}", );

//     for (key, value) in &scores {
//         println!("{key}: {value}");
//     }
// }

fn main() {
    let field_name = String::from("Favorite color");
    let field_value = String::from("Blue");

    let mut map = HashMap::new();
    map.insert(field_name, field_value);

    // println!("{field_name}, {field_value}")

    // let mut a: i32 = 0;
    // let b = &mut a;
    // let c = &*b + 1;
}
