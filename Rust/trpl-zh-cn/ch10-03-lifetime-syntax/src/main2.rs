// 结构体定义中的生命周期注解

// 这个注解意味着 ImportantExcerpt 的实例不能比其 part 字段中的引用存在的更久。
// 不能 part 不存在了，ImportantExcerpt 还存在吧
struct ImportantExcerpt<'a> {
    part: &'a str,
}

fn main() {
    let novel = String::from("Call me Ishmael. Some years ago...");
    let first_sentence = novel.split('.').next().unwrap();
    let i = ImportantExcerpt {
        part: first_sentence,
    };
}

impl<'a> ImportantExcerpt<'a> {
    // 一个参数不需要标注
    fn level(&self) -> i32 {
        3
    }
}

impl<'a> ImportantExcerpt<'a> {
    // 包含 self 不需要标注
    fn announce_and_return_part(&self, announcement: &str) -> &str {
        println!("Attention please: {announcement}");
        self.part
    }
}
