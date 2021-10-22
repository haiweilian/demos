const types = require('../../types');
const Scope = require('./Scope');
const generate = require('../../generator');

// 节点信息
module.exports = class NodePath {
    constructor(node, parent, parentPath, key, listKey) {
        this.node = node;
        this.parent = parent;
        this.parentPath = parentPath;
        // key listKey 记录当前节点在父节点的哪个属性上
        // key = parent.params
        // listKey = parent.parent[1]
        // parent[key][listKey]
        this.key = key;
        this.listKey = listKey;

        // 操作方法添加到当前节点上
        Object.keys(types).forEach(key => {
            if (key.startsWith('is')) {
                this[key] = types[key].bind(this, node);
            }
        })
    }

    get scope() {
        if (this.__scope) {
            return this.__scope;
        }
        const isBlock = this.isBlock();
        const parentScope = this.parentPath && this.parentPath.scope;
        return this.__scope = isBlock ? new Scope(parentScope, this) : parentScope;
    }

    // 添加标记
    skip() {
        this.node.__shouldSkip = true;
    }

    // 获取标记
    isBlock() {
        return types.visitorKeys.get(this.node.type).isBlock;
    }

    // 替换
    replaceWith(node) {
        if (this.listKey != undefined) {
            this.parent[this.key].splice(this.listKey, 1, node);
        } else {
            this.parent[this.key] = node
        }
    }

    // 删除
    remove () {
        if (this.listKey != undefined) {
            this.parent[this.key].splice(this.listKey, 1);
        } else {
            this.parent[this.key] = null;
        }
    }

    // 往上查找，不包含自己
    findParent(callback) {
        let curPath = this.parentPath;
        while (curPath && !callback(curPath)) {
            curPath = curPath.parentPath;
        }
        return curPath;
    }

    // 往上查找，包含自己
    find(callback) {
        let curPath = this;
        while (curPath && !callback(curPath)) {
            curPath = curPath.parentPath;
        }
        return curPath;
    }

    // 遍历子节点
    traverse(visitors) {
        const traverse = require('../index');
        const defination = types.visitorKeys.get(this.node.type);

        if (defination.visitor) {
            defination.visitor.forEach(key => {
                const prop = this.node[key];
                if (Array.isArray(prop)) { // 如果该属性是数组
                    prop.forEach((childNode, index) => {
                        traverse(childNode, visitors, this.node, this);

                    })
                } else {
                    traverse(prop, visitors, this.node, this);
                }
            })
        }
    }

    // 调用 generate 把当前节点打印成目标代码
    toString() {
        return generate(this.node).code;
    }
}
