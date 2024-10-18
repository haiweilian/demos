// struct User {
//     active: bool,
//     username: String,
//     email: String,
//     sign_in_count: u64,
// }

// fn build_user(email: String, username: String) -> User {
//     User {
//         email, // 字段初始化简写语法
//         username: username,
//         active: true,
//         sign_in_count: 1,
//     }
// }

// fn main() {
//     let user = User {
//         email: String::from("someone@example.com"),
//         username: String::from("someusername123"),
//         active: true,
//         sign_in_count: 1,
//     };

//     let mut user1 = build_user(
//         String::from("anotheremail@example.com"),
//         String::from("someusername123")
//     );
//     // 修改值
//     user1.email = String::from("anotheremail@example.com");

//     // 从 user 中读取剩余参数，但 user.username 不再可用，因为它移动了所有权。
//     // let user2 = User {
//     //     email: String::from("another@example.com"),
//     //     ..user
//     // };
//     // println!("{}, {}", user.active, user.username);

//     // 标量值还是正常的，因为实现了 Copy trait
//     let user2 = User {
//         email: String::from("another@example.com"),
//         username: String::from("someusername123"),
//         ..user
//     };
//     println!("{}, {}", user.active, user.username);
// }

struct Color(i32, i32, i32);
struct Point(i32, i32, i32);

fn main() {
    let black = Color(0, 0, 0);
    let Point(x, y, z) = Point(0, 0, 0);

    println!("{}, {}, {}", black.0, black.1, black.2);
    println!("{}, {}, {}", x, y, z)
}
