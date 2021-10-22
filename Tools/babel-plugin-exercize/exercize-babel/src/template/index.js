const parser = require('../parser');

// 调用 parse 返回 ast
function template(code) {
    return parser.parse(code, {
        plugins: ['literal']
    });
}

// 创建表达式
template.expression = function(code) {
    const node = template(code).body[0].expression;
    node.loc = null;
    return node;
}

module.exports = template;
