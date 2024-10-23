mod lib;  // 假设宏定义在 lib.rs 文件中

fn main() {
    let my_vec = myvec![1, 2, 3];  // 使用 vec! 宏
    println!("{:?}", my_vec);
}
