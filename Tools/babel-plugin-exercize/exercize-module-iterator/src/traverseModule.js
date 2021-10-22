const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const fs = require('fs');
const path = require('path');
const DependencyNode = require('./DependencyNode');

const visitedModules = new Set();

const IMPORT_TYPE = {
    deconstruct: 'deconstruct',
    default: 'default',
    namespace: 'namespace'
}
const EXPORT_TYPE = {
    all: 'all',
    default: 'default',
    named: 'named'
}

function resolveBabelSyntaxtPlugins(modulePath) {
    const plugins = [];
    if (['.tsx', '.jsx'].some(ext => modulePath.endsWith(ext))) {
        plugins.push('jsx');
    }
    if (['.ts', '.tsx'].some(ext => modulePath.endsWith(ext))) {
        plugins.push('typescript');
    }
    return plugins;
}

function isDirectory(filePath) {
    try {
        return fs.statSync(filePath).isDirectory()
    }catch(e) {}
    return false;
}

function completeModulePath (modulePath) {
    const EXTS = ['.tsx','.ts','.jsx','.js'];
    if (modulePath.match(/\.[a-zA-Z]+$/)) {
        return modulePath;
    }

    function tryCompletePath (resolvePath) {
        for (let i = 0; i < EXTS.length; i ++) {
            let tryPath = resolvePath(EXTS[i]);
            if (fs.existsSync(tryPath)) {
                return tryPath;
            }
        }
    }

    function reportModuleNotFoundError (modulePath) {
        throw 'module not found: ' + modulePath;
    }

    if (isDirectory(modulePath)) {
        const tryModulePath = tryCompletePath((ext) => path.join(modulePath, 'index' + ext));
        if (!tryModulePath) {
            reportModuleNotFoundError(modulePath);
        } else {
            return tryModulePath;
        }
    } else if (!EXTS.some(ext => modulePath.endsWith(ext))) {
        const tryModulePath = tryCompletePath((ext) => modulePath + ext);
        if (!tryModulePath) {
            reportModuleNotFoundError(modulePath);
        } else {
            return tryModulePath;
        }
    }
    return modulePath;
}

function moduleResolver (curModulePath, requirePath) {

    requirePath = path.resolve(path.dirname(curModulePath), requirePath);

    // 过滤掉第三方模块
    if (requirePath.includes('node_modules')) {
        return '';
    }

    requirePath =  completeModulePath(requirePath);

    if (visitedModules.has(requirePath)) {
        return '';
    } else {
        visitedModules.add(requirePath);
    }
    return requirePath;
}

// 读取文件内容、parse 成 AST、travese AST 提取模块信息和依赖信息、递归遍历依赖（先把路径处理成绝对路径）
function traverseJsModule(curModulePath, dependencyGrapthNode, allModules) {
    // 读取文件
    const moduleFileContent = fs.readFileSync(curModulePath, {
        encoding: 'utf-8'
    });
    dependencyGrapthNode.path = curModulePath;

    // 解析成 ast
    const ast = parser.parse(moduleFileContent, {
        sourceType: 'unambiguous',
        // 根据不同的后缀名添加对应的插件
        plugins: resolveBabelSyntaxtPlugins(curModulePath)
    });

    // 遍历
    traverse(ast, {
        // 当是导入语句时
        ImportDeclaration(path) {
            // 获取到绝对路径
            const subModulePath = moduleResolver(curModulePath, path.get('source.value').node);
            if (!subModulePath) {
                return;
            }

            // 获取到当前子模块的导入的信息
            const specifierPaths = path.get('specifiers');
            dependencyGrapthNode.imports[subModulePath] = specifierPaths.map(specifierPath => {
                if (specifierPath.isImportSpecifier()) {
                    return {
                        type: IMPORT_TYPE.deconstruct,
                        imported: specifierPath.get('imported').node.name,
                        local: specifierPath.get('local').node.name
                    }
                } else if (specifierPath.isImportDefaultSpecifier()) {
                    return {
                        type: IMPORT_TYPE.default,
                        local: specifierPath.get('local').node.name
                    }
                } else {
                    return {
                        type: IMPORT_TYPE.namespace,
                        local: specifierPath.get('local').node.name
                    }
                }
            });

            // 递归处理依赖信息
            const subModule = new DependencyNode();
            traverseJsModule(subModulePath, subModule, allModules);
            dependencyGrapthNode.subModules[subModule.path] = subModule;
        },
        ExportDeclaration(path) {
            if(path.isExportNamedDeclaration()) {
                const specifiers = path.get('specifiers');
                dependencyGrapthNode.exports = specifiers.map(specifierPath => ({
                    type: EXPORT_TYPE.named,
                    exported: specifierPath.get('exported').node.name,
                    local: specifierPath.get('local').node.name
                }));
            } else if (path.isExportDefaultDeclaration()) {
                let exportName;
                const declarationPath = path.get('declaration');
                if(declarationPath.isAssignmentExpression()) {
                    exportName = declarationPath.get('left').toString();
                } else {
                    exportName = declarationPath.toString()
                }
                dependencyGrapthNode.exports.push({
                    type: EXPORT_TYPE.default,
                    exported: exportName
                });
            } else {
                dependencyGrapthNode.exports.push({
                    type: EXPORT_TYPE.all,
                    exported: path.get('exported').node.name,
                    source: path.get('source').node.value
                });
            }
        }
    });
    allModules[curModulePath] = dependencyGrapthNode;
}

module.exports = function(curModulePath) {
    const dependencyGraph = {
        root: new DependencyNode(),
        allModules: {}
    };
    // 从入口模块开启
    traverseJsModule(curModulePath, dependencyGraph.root, dependencyGraph.allModules);
    return dependencyGraph;
}
