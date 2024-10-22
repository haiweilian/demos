use std::ops::Deref;

struct MyBox<T>(T);
impl<T> MyBox<T> {
    fn new(x: T) -> MyBox<T> {
        MyBox(x)
    }
}

impl<T> Deref for MyBox<T> {
    type Target = T;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

fn main() {
    let x = 5;
    let y = &x; // 引用
    let z = MyBox::new(x);

    assert_eq!(5, x);
    // assert_eq!(5, y); // 错误，无法与引用值比较
    assert_eq!(5, *y); // 因为是一个引用，所以必须要 `解引用运算符` 获取真实的值再比较
    assert_eq!(5, *z);
    assert_eq!(5, *(z.deref())); // 实现 Deref trait，编译器底层将会这样解引用
}

// fn hello(name: &str) {
//     println!("Hello, {name}!");
// }

// Deref 强制转换如何与可变性交互
// 当 T: Deref<Target=U> 时从 &T 到 &U。
// 当 T: DerefMut<Target=U> 时从 &mut T 到 &mut U。
// 当 T: Deref<Target=U> 时从 &mut T 到 &U。
// fn main() {
//     let mut m = MyBox::new(String::from("Rust"));
//     hello(&m);
//     hello(&mut m);
// }
