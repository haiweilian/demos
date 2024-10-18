// enum IpAddrKind {
//     V4,
//     V6
// }

// struct IpAddr {
//     kind: IpAddrKind,
//     address: String,
// }

// fn main() {
//     route(IpAddrKind::V4);
//     route(IpAddrKind::V6);

//     let v4 = IpAddr {
//         kind: IpAddrKind::V4,
//         address: String::from("127.0.0.1")
//     };

//     let v6 = IpAddr {
//         kind: IpAddrKind::V6,
//         address: String::from("::1")
//     };
// }

// fn route(ip: IpAddrKind) -> IpAddrKind {
//     ip
// }

// enum IpAddr {
//     V4(u8, u8, u8, u8),
//     V6(String)
// }

// fn main() {
//     let v4 = IpAddr::V4(127, 0, 0, 1);
//     let v6 = IpAddr::V6(String::from("::1"));
// }

// enum Message {
//     Quit,
//     Move { x: i32, y: i32 },
//     Write(String),
//     ChangeColor(i32, i32, i32),
// }
// impl Message {
//     fn call(&self) {
//         // 在这里定义方法体
//     }
// }

// struct QuitMessage; // 类单元结构体
// struct MoveMessage {
//     x: i32,
//     y: i32,
// }
// struct WriteMessage(String); // 元组结构体
// struct ChangeColorMessage(i32, i32, i32); // 元组结构体
// enum Message2 {
//     Quit(QuitMessage),
//     Move(MoveMessage),
//     Write(WriteMessage),
//     ChangeColor(ChangeColorMessage),
// }
// impl Message2 {
//     fn call(&self) {
//         // 在这里定义方法体
//     }
// }

// fn main() {
//     let m = Message::Write(String::from("hello"));
//     m.call();

//     let m2 = Message2::Write(WriteMessage(String::from("hello")));
//     m2.call();
// }

fn main() {
    let some_number = Some(5);
    let some_char = Some('e');

    let absent_number : Option<i32> = some_number;
    let absent_char : Option<char> = some_char;

    // 错误，应为  some_number 可能为空值
    // let sum = 3 * some_number;
}
