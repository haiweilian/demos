
class Binding {
    constructor(id, path, scope, kind) {
        this.id = id;
        this.path = path;
        this.referenced = false;
        this.referencePaths = [];
    }
}
class Scope {
    constructor(parentScope, path) {
        // 父作用域
        this.parent = parentScope;
        this.bindings = {};
        this.path = path;

        // 声明类型
        path.traverse({
            VariableDeclarator: (childPath) => {
                this.registerBinding(childPath.node.id.name, childPath);
            },
            FunctionDeclaration: (childPath) => {
                // 函数有自己的作用域，跳过之后的节点
                childPath.skip();
                this.registerBinding(childPath.node.id.name, childPath);
            }
        });

        // 获取到标识，如果这个标识存在 binding 的 referencePaths 中，证明引用此声明。
        path.traverse({
            Identifier: childPath =>  {
                if (!childPath.findParent(p => p.isVariableDeclarator() || p.isFunctionDeclaration())) {
                    const id = childPath.node.name;
                    const binding = this.getBinding(id);
                    if (binding) {
                        binding.referenced = true;
                        binding.referencePaths.push(childPath);
                    }
                }
            }
        });
    }

    registerBinding(id, path) {
        this.bindings[id] = new Binding(id, path);
    }

    getOwnBinding(id) {
        return this.bindings[id];
    }

    getBinding(id) {
        let res = this.getOwnBinding(id);
        if (res === undefined && this.parent) {
            res = this.parent.getOwnBinding(id);
        }
        return res;
    }

    hasBinding(id) {
        return !!this.getBinding(id);
    }
}

module.exports = Scope;
