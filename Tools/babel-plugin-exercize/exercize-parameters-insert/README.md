1、通过 node.callee 获取到语句 console.xxx。
2、通过 node.loc 获取到代码位置。
3、通过 emplate.expression(``) 创建一个 ast。
4、通过 path.insertBefore(ast) 插入一条新的节点，如果在 jsx 内需要替换成数组。
