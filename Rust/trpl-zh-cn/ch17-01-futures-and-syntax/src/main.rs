use trpl::{Either, Html};
use std::env;

async fn page_title(url: &str) -> Option<String> {
    let res = trpl::get(url).await;
    let res_text = res.text().await;
    Html::parse(&res_text)
        .select_first("title")
        .map(|t| t.inner_html())
}

// fn main() {
//     let args: Vec<String> = env::args().collect();
//     let url = &args[1];

//     trpl::run(async {
//         match page_title(url).await {
//             Some(t) => println!("{t}"),
//             None => println!("none"),
//         }
//     });
// }

fn main() {
    let args: Vec<String> = env::args().collect();
    let l = page_title(&args[1]);
    let r = page_title(&args[2]);

    trpl::run(async {
        match trpl::race(l, r).await {
            Either::Left(x) => {
                println!("left {}", x.unwrap())
            }
            Either::Right(x) => {
                println!("right {}", x.unwrap())
            }
        }
    })
}
