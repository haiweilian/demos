const parser = require('../parser');
const traverse = require('../traverse');
const generate = require('../generator');
const template = require('../template');

function transformSync(code, options) {
    // 1、先 parse + 解析配置
    const ast = parser.parse(code, options.parserOpts);

    const pluginApi = {
        template
    }
    const visitors = {};
    // 2、调用配置的插件，把 api 和插件配置传入过 declare((api, options, dirname)
    options.plugins && options.plugins.forEach(([plugin, options]) => {
        const res = plugin(pluginApi, options);
        Object.assign(visitors, res.visitor);
    });
    // 3、调用预设 从 右 到 左，因为预设是一组插件的集合，所有也是调用插件
    options.presets && options.presets.reverse().forEach(([preset, options]) => {
        const plugins = preset(pluginApi, options);
        plugins.forEach(([plugin, options])=> {
            const res = plugin(pluginApi, options);
            Object.assign(visitors, res.visitor);
        })
    })

    traverse(ast, visitors);
    return generate(ast, code, options.fileName);
}

module.exports = {
    transformSync
}
