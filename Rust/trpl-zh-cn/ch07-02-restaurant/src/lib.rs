mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}

        fn seat_at_table() {}
    }

    mod serving {
        fn take_order() {}

        fn serve_order() {}

        fn take_payment() {}
    }
}

fn deliver_order() {}

mod back_of_house {

    pub struct Breakfast {
        pub toast: String,
        seasonal_fruit: String,
    }

    impl Breakfast {
        pub fn summer(toast: &str) -> Breakfast {
            Breakfast {
                toast: String::from(toast),
                seasonal_fruit: String::from("peaches"),
            }
        }
    }

    fn fix_incorrect_order() {
        cook_order();
        super::deliver_order();
    }

    fn cook_order() {}
}

// pub 公开导入，重导出
pub use crate::front_of_house::hosting;

pub fn eat_at_restaurant() {
    // 绝对路径
    crate::front_of_house::hosting::add_to_waitlist();

    // 相对路径
    front_of_house::hosting::add_to_waitlist();

     // 在夏天订购一个黑麦土司作为早餐
     let mut meal = back_of_house::Breakfast::summer("Rye");
     // 改变主意更换想要面包的类型
     meal.toast = String::from("Wheat");
     println!("I'd like {} toast please", meal.toast);

     // 如果取消下一行的注释代码不能编译；
     // 不允许查看或修改早餐附带的季节水果
     // meal.seasonal_fruit = String::from("blueberries");

    //  hosting 简短路径
    hosting::add_to_waitlist();
}

// use 语句只适用于其所在的作用域
// mod customer {
//     use crate::front_of_house::hosting;

//     pub fn eat_at_restaurant() {
//         hosting::add_to_waitlist();
//     }
// }

// 1、引入方法时禁用引入到父模块路径
// 2、引入结构体，枚举时尽量引入到具体的路径
// 3、命名冲突时使用 as 提供别名
// use std::fmt::Result;
// use std::io::Result as IoResult;

// fn function1() -> Result {
//     // --snip--
// };

// fn function2() -> IoResult<()> {
//     // --snip--
// };

// 嵌套路径，合并导入
// use std::cmp::Ordering;
// use std::io;
use std::{cmp::Ordering, io};

// glob 运算符 * 引入所有公开项
use std::collections::*;
