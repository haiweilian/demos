fn main() {
    let config_max = Some(100);

    // match 匹配时穷举的
    match config_max {
        Some(max) => {
            println!("max value {}", max)
        },
        _ => () // _ 占位符，省略其他
    }

    match config_max {
        Some(max) => {
            println!("max value {}", max)
        },
        None => {
            println!("max value 0")
        }
    }

    // 简短的语法，可以理解为上面的语法糖
    if let Some(max) = config_max {
        println!("max value {}", max)
    }

    if let Some(max) = config_max {
        println!("max value {}", max)
    } else {
        println!("max value 0")
    }
}
