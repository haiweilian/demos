const { declare } = require('@babel/helper-plugin-utils');
const generate = require('@babel/generator').default;

// 简化判断语句
const targetCalleeName = ['log', 'info', 'error', 'debug'].map(item => `console.${item}`);

const parametersInsertPlugin = (api, options, dirname) => {
  const { types, template } = api
  return {
    visitor: {
      // 表达式语句的时候进入
      CallExpression(path, state) {
        // 新添加的节点不处理
        if(path.node.isNew) return

        // ast 转化成代码判断
        // const calleeName = generate(path.node.callee).code
        const calleeName = path.get('callee').toString()

        if(targetCalleeName.includes(calleeName)) {
          // 获取位置信息
          const { line, column } = path.node.loc.start
          // 生成一个新的 ast
          const newNode = template.expression(`console.log("loc：line: ${line} column: ${column}")`)()
          newNode.isNew = true
          // 如果是在 jsx 内，转成成数组，反之在语句前插入一条
          // p.isJSXElement() === types.isJSXElement() 判断方法在节点上有
          if(path.findParent(p => p.isJSXElement())) {
            path.replaceWith(types.arrayExpression([newNode, path.node]))
            path.skip()
          }else {
            path.insertBefore(newNode)
          }

          const p = path
        }
      }
    }
  }
}

module.exports = parametersInsertPlugin;
