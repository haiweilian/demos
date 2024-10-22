use minigrep::Config;
use std::env;
use std::process;

fn main() {
    let args: Vec<String> = env::args().collect();
    let config = Config::build(&args).unwrap_or_else(|err| {
        eprintln!("错误信息：{err}");
        process::exit(1);
    });
    dbg!(&args);
    println!("query {}", config.query);
    println!("file_path {}", config.file_path);

    if let Err(err) = minigrep::run(config) {
        eprintln!("错误信息：{err}");
        process::exit(1);
    }
}
