// 在 Rust 中，`&str`、`char` 和 `String` 是三种不同的字符串相关类型，它们各自有不同的用途和特点：

// ### 1. `&str` (字符串切片)

// - **定义**: `&str` 是一个字符串切片，表示对字符串的借用引用，类似于常量字符串。
// - **存储位置**: 通常存储在堆栈上或者静态内存中（例如，字符串字面量），不能修改。
// - **特点**:
//   - 它是一个不可变的引用，因此不会拥有数据的所有权。
//   - 字符串的内容以 UTF-8 编码存储。
//   - 长度是已知的，但内容不可修改。
// - **常见用途**: 用于表示借用字符串的场景，常常在函数参数中使用，因为它不会移动数据所有权。

//   **例子**:
//   ```rust
//   let s: &str = "Hello, world!";
//   ```

// ### 2. `char` (字符)

// - **定义**: `char` 是 Rust 中的字符类型，表示一个 Unicode 标量值，占用 4 字节（32 位）。
// - **特点**:
//   - 可以表示任何 Unicode 字符，不局限于 ASCII。
//   - 每个 `char` 都代表一个完整的字符，而不是字节（在 Rust 中，单个字符的长度不固定，因此字符串不是用 `char` 数组表示的，而是用字节数组）。
//   - 长度固定，始终为 4 字节。

//   **例子**:
//   ```rust
//   let c: char = 'H';
//   ```

// ### 3. `String` (堆分配的可变字符串)

// - **定义**: `String` 是一个在堆上分配的、可变的字符串类型，拥有其数据的所有权。
// - **存储位置**: `String` 的内容存储在堆内存中，可以动态扩展或缩减。
// - **特点**:
//   - 可变，可以在运行时追加或修改内容。
//   - 数据是 UTF-8 编码的。
//   - 拥有数据的所有权，可以转移或传递数据所有权。
//   - 因为它是堆分配的，所以相较于 `&str` 会有更多的内存和性能开销。

//   **常见用途**: 适合需要动态修改和操作字符串的场景。

//   **例子**:
//   ```rust
//   let mut s: String = String::from("Hello");
//   s.push_str(", world!");
//   ```

// ### 区别总结

// | 类型   | 拥有数据所有权 | 可变性  | 存储位置      | 典型用途                      |
// |--------|---------------|--------|---------------|-------------------------------|
// | `&str` | 否            | 否     | 栈上或静态内存 | 表示借用的不可变字符串          |
// | `char` | 是            | 否     | 栈上          | 表示单个字符                    |
// | `String` | 是            | 是     | 堆上          | 可变字符串，适合动态操作字符串 |

// ### 例子：它们如何协同工作

// ```rust
// fn main() {
//     let s1: &str = "Hello";  // 字符串切片，指向字符串字面量
//     let mut s2: String = String::from("World");  // 堆分配的可变字符串
//     let c: char = '!';  // 单个字符

//     s2.push(c);  // 将字符追加到 String 中
//     println!("{}, {}{}", s1, s2, c);  // 打印结果：Hello, World!
// }
// ```

// 在这个例子中，`&str` 用于借用静态字符串，`String` 用于动态字符串处理，而 `char` 用于处理单个字符。


// fn main() {
//     let mut s = String::new();
//     let hello = String::from("السلام عليكم");
//     let hello = String::from("Dobrý den");
//     let hello = String::from("Hello");
//     let hello = String::from("שלום");
//     let hello = String::from("नमस्ते");
//     let hello = String::from("こんにちは");
//     let hello = String::from("안녕하세요");
//     let hello = String::from("你好");
//     let hello = String::from("Olá");
//     let hello = String::from("Здравствуйте");
//     let hello = String::from("Hola");

//     let mut s = String::from("foo");
//     s.push_str("bar");


//     let s1 = String::from("Hello, ");
//     let s2 = String::from("world!");
//     let s3 = s1 + &s2; // 注意 s1 被移动了，不能继续使用
// }

// fn main() {
//     let s1 = String::from("tic");
//     let s2 = String::from("tac");
//     let s3 = String::from("toe");

//     let s = format!("{s1}-{s2}-{s3}");
//     println!("{s}")
// }


fn main() {
    let s = String::from("你好，世界");

    for i in s.chars() {
        println!("{i}")
    }

    for i in s.bytes() {
        println!("{i}")
    }

    let s1 = &s[1..];

    println!("{s}")
}
