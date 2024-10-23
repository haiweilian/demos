use std::ops::Add;

// #[derive(Debug, Copy, Clone, PartialEq)]
// struct Point {
//     x: i32,
//     y: i32,
// }

// 不指定类型两个相同的类型运算
// impl Add for Point {
//     type Output = Point;
//     fn add(self, rhs: Point) -> Point {
//         Point {
//             x: self.x + rhs.x,
//             y: self.y + rhs.y
//         }
//     }
// }

// fn main() {
//     assert_eq!(
//         Point { x: 1, y: 0 } + Point { x: 2, y: 3 },
//         Point { x: 3, y: 3 }
//     );
// }

// struct Millimeters(u32);
// struct Meters(u32);

// // 指定类型，两个不同的类型运算
// impl Add<Meters> for Millimeters {
//     type Output = Millimeters;
//     fn add(self, rhs: Meters) -> Millimeters {
//         Millimeters(self.0 + (rhs.0 * 1000))
//     }
// }

// fn main() {
//     let x = Millimeters(1);
//     let y = Meters(1);
//     let z = x + y;
//     // let z = y + x;
//     println!("{}", z.0)
// }

// trait Pilot {
//     fn fly(&self);
// }

// trait Wizard {
//     fn fly(&self);
// }

// struct Human;

// impl Pilot for Human {
//     fn fly(&self) {
//         println!("This is your captain speaking.");
//     }
// }

// impl Wizard for Human {
//     fn fly(&self) {
//         println!("Up!");
//     }
// }

// impl Human {
//     fn fly(&self) {
//         println!("*waving arms furiously*");
//     }
// }

// fn main() {
//     let person = Human;
//     person.fly();
//     Pilot::fly(&person);
//     Wizard::fly(&person);
// }


// trait Animal {
//     fn baby_name() -> String;
// }

// struct Dog;

// impl Dog {
//     fn baby_name() -> String {
//         String::from("Spot")
//     }
// }

// impl Animal for Dog {
//     fn baby_name() -> String {
//         String::from("puppy")
//     }
// }

// fn main() {
//     println!("A baby dog is called a {}", <Dog as Animal>::baby_name());
// }

use std::fmt;

// 在具有 Display 类型上扩展
trait OutlinePrint: fmt::Display {
    fn outline_print(&self) {
        let output = self.to_string();
        let len = output.len();
        println!("{}", "*".repeat(len + 4));
        println!("*{}*", " ".repeat(len + 2));
        println!("* {output} *");
        println!("*{}*", " ".repeat(len + 2));
        println!("{}", "*".repeat(len + 4));
    }
}

struct Point {
    x: u32,
    y: u32
}

impl OutlinePrint for Point {}

impl fmt::Display for Point {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "({}, {})", self.x, self.y)
    }
}

fn main() {
    let p = Point {
        x: 1,
        y: 1
    };
    p.outline_print();
}
