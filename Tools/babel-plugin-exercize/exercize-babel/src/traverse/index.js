const { visitorKeys } = require('../types');
const NodePath = require('./path/NodePath');

module.exports = function traverse(node, visitors, parent, parentPath, key, listKey) {

    const defination = visitorKeys.get(node.type);

    // 获取到对应类型类型的 enter 和 exit 函数，传入当前节点并传入
    let visitorFuncs = visitors[node.type] || {};
    if(typeof visitorFuncs === 'function') {
        visitorFuncs = {
            enter: visitorFuncs
        }
    }

    // path 代表当前节点的信息和当前节点的操作方法和当前节点的上级关机
    const path = new NodePath(node, parent, parentPath, key, listKey);

    // 遍历前，调用并传入 path
    visitorFuncs.enter && visitorFuncs.enter(path);

    // skip() 函数添加的标记，可以跳过此结果的
    if(node.__shouldSkip) {
        delete node.__shouldSkip;
        return;
    }

    // 深度遍历可遍历的属性
    if (defination.visitor) {
        defination.visitor.forEach(key => {
            const prop = node[key];
            if (Array.isArray(prop)) { // 如果该属性是数组
                prop.forEach((childNode, index) => {
                    traverse(childNode, visitors, node, path, key, index);
                })
            } else {
                traverse(prop, visitors, node, path, key);
            }
        })
    }

    // 遍历后，调用并传入 path
    visitorFuncs.exit && visitorFuncs.exit(path);
}
