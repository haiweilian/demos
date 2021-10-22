const { declare } = require('@babel/helper-plugin-utils');
const importModule = require('@babel/helper-module-imports');

const autoTrackPlugin = declare((api, options, dirname) => {
    api.assertVersion(7);

    return {
        visitor: {
            Program: {
                enter (path, state) {
                    // 遍历看有没有导入过
                    path.traverse({
                        // import 进入
                        ImportDeclaration (curPath) {
                            const requirePath = curPath.get('source').node.value;
                            // 如果已经手动引入了，import xx，那么就直接使用名字作为标识
                            // let a = curPath.get('specifiers.0');
                            // let b = a.get('local').toString();
                            if (requirePath === options.trackerPath) { // 如果已经引入了
                                const specifierPath = curPath.get('specifiers.0');
                                if (specifierPath.isImportSpecifier()) {
                                    state.trackerImportId = specifierPath.toString();
                                } else if(specifierPath.isImportNamespaceSpecifier()) {
                                    state.trackerImportId = specifierPath.get('local').toString();
                                }
                                path.stop();
                            }
                        }
                    });
                    // 如果不存在就创建
                    if (!state.trackerImportId) {
                        state.trackerImportId  = importModule.addDefault(path, 'tracker',{
                            // 生成唯一id
                            nameHint: path.scope.generateUid('tracker')
                        }).name;
                        // 埋点代码的 AST
                        state.trackerAST = api.template.statement(`${state.trackerImportId}()`)();
                    }
                }
            },
            'ClassMethod|ArrowFunctionExpression|FunctionExpression|FunctionDeclaration'(path, state) {
                const bodyPath = path.get('body');
                if (bodyPath.isBlockStatement()) {
                    // 有函数体添加
                    bodyPath.node.body.unshift(state.trackerAST);
                } else {
                    // 没有包裹一下
                    const ast = api.template.statement(`{${state.trackerImportId}();return PREV_BODY;}`)({PREV_BODY: bodyPath.node});
                    bodyPath.replaceWith(ast);
                }
            }
        }
    }
});
module.exports = autoTrackPlugin;
