use std::fmt::Display;

// 定义 trait
pub trait Summary {
    fn summarize(&self) -> String {
        String::from("(Read more...)")
    }
}

pub struct NewsArticle {
    pub headline: String,
    pub location: String,
    pub author: String,
    pub content: String,
}

// 实现 trait 到 NewsArticle 类型
impl Summary for NewsArticle {}

pub struct Tweet {
    pub username: String,
    pub content: String,
    pub reply: bool,
    pub retweet: bool,
}

// 实现 trait 到 Tweet 类型，这样 Tweet 类型就拥有了 trait 上的方法
impl Summary for Tweet {
    fn summarize(&self) -> String {
        format!("{}: {}", self.username, self.content)
    }
}

// 可以理解为类型约束
pub fn notyfy(item: &impl Summary) {
    println!("Breaking news! {}", item.summarize());
}

// 可以理解为类型约束
// pub fn notyfy<T: Summary>(item: &T) {
//     println!("Breaking news! {}", item.summarize());
// }

// 可以理解为联合类型，传入的类型也必须实现 Display
// pub fn notyfy(item: &(impl Summary + Display)) {
//     println!("Breaking news! {}", item);
// }

// 可以理解为联合类型，传入的类型也必须实现 Display
// pub fn notyfy<T: Summary + Display>(item: &T) {
//     println!("Breaking news! {}", item);
// }

// 通过 where 指定
// pub fn notyfy<T>(item: &T)
// where T: Summary + Display {
//     println!("Breaking news! {}", item);
// }

// 返回一个实现了 Summary 的类型
// fn returns_summarizable () -> impl Summary {
//     Tweet {
//         username: String::from("horse_ebooks"),
//         content: String::from(
//             "of course, as you probably already know, people",
//         ),
//         reply: false,
//         retweet: false,
//     }
// }


// 有条件地实现方法，根据类型不同实现不同的方法
struct Pair<T> {
    x: T,
    y: T,
}

impl<T> Pair<T> {
    fn new(x: T, y: T) -> Self {
        Self { x, y }
    }
}

// 泛型约束，也就是参数必须同时实现 Display 和 PartialOrd 两个 trait。
impl<T: Display + PartialOrd> Pair<T> {
    fn cmp_display(&self) {
        if self.x >= self.y {
            println!("The largest member is x = {}", self.x);
        } else {
            println!("The largest member is y = {}", self.y);
        }
    }
}

fn pair_call() {
    // 实现了 new 方法
    let p = Pair::new(1, 2);
    // 数字实现了 Display 和 PartialOrd 可以调用
    p.cmp_display();


    let tweet = Tweet{
        username: String::from("horse_ebooks"),
        content: String::from(
            "of course, as you probably already know, people",
        ),
        reply: false,
        retweet: false,
    };
    let p2 = Pair::new(&tweet, &tweet);
    // Tweet 没有实现 Display 和 PartialOrd 不能调用
    // p2.cmp_display();
}
