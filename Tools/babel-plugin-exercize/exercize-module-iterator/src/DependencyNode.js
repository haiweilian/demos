// 模块信息
module.exports = class DependencyNode {
    constructor(path = '', imports = {}, exports = []) {
        // 路径
        this.path = path;
        // import
        this.imports = imports;
        // export
        this.exports = exports;
        // 子模块
        this.subModules = {};
    }
}
