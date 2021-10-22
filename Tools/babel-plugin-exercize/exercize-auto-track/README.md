1、现有编译 ImportDeclaration 类型看看有没有引入过。
1.1 引入过直接获取id(specifiers.0)。
1.2 没有添加一条import，并 生产唯一的id path.scope.generateUid。
2、在函数类型的函数体(body)插入一条执行语句。
