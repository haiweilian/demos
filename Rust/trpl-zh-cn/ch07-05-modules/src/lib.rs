mod front_of_house;

mod back_of_house;

// use 将路径引入作用域
// pub 公开导入，重导出
pub use crate::front_of_house::hosting;
use crate::back_of_house::break_fast::Breakfast;

pub fn eat_at_restaurant() {
    // 绝对路径
    crate::front_of_house::hosting::add_to_waitlist();

    // 相对路径
    front_of_house::hosting::add_to_waitlist();

     // 在夏天订购一个黑麦土司作为早餐
     let mut meal = Breakfast::summer("Rye");
     // 改变主意更换想要面包的类型
     meal.toast = String::from("Wheat");
     println!("I'd like {} toast please", meal.toast);

     // 如果取消下一行的注释代码不能编译；
     // 不允许查看或修改早餐附带的季节水果
     // meal.seasonal_fruit = String::from("blueberries");

    //  hosting 简短路径
    hosting::add_to_waitlist();
}
