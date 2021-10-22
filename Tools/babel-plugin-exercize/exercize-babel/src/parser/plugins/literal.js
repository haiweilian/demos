module.exports = function(Parser) {
    return class extends Parser {
        parseLiteral (...args) {
            const node = super.parseLiteral(...args);
            // 根据值扩展类型
            switch(typeof node.value) {
                case 'number':
                    node.type = 'NumericLiteral';
                    break;
                case 'string':
                    node.type = 'StringLiteral';
                    break;
            }
            return  node;
        }
    }
}
