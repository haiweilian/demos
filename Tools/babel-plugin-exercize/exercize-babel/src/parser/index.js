const acorn = require("acorn");

const syntaxPlugins = {
    'literal': require('./plugins/literal')
}

const defaultOptions = {
    plugins: []
}

function parse(code, options) {
    // 合并配置
    const resolvedOptions  = Object.assign({}, defaultOptions, options);

    // 扩展 acorn
    const newParser = resolvedOptions.plugins.reduce((Parser, pluginName) => {
        let plugin = syntaxPlugins[pluginName]
        return plugin ? Parser.extend(plugin) : Parser;
    }, acorn.Parser);

    // 解析返回 ast
    return newParser.parse(code, {
        locations: true
    });
}

module.exports = {
    parse
}
