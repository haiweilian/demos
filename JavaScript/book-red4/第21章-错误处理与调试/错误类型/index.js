throw new Error("基类型，其他错误类型基础该类型");
throw new InternalError("底层JavaScript 引擎抛出异常时由浏览器抛出(无法手动调用)");
throw new EvalError("使用 eval 函数发生异常时抛出");
throw new RangeError("数值越界时抛出");
throw new ReferenceError("到不到对象时发生");
throw new SyntaxError("语法错误时发生");
throw new TypeError("类型不是预期类型");
throw new URIError("使用 encodeURI() 或  decodeURI() 传入了格式错误的 URI");
