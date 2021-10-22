const { declare } = require('@babel/helper-plugin-utils');

const base54 = (function(){
    var DIGITS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_";
    return function(num) {
            var ret = "";
            do {
                    ret = DIGITS.charAt(num % 54) + ret;
                    num = Math.floor(num / 54);
            } while (num > 0);
            return ret;
    };
})();

const mangle = declare((api, options, dirname) => {
    api.assertVersion(7);

    return {
        pre(file) {
            file.set('uid', 0);
        },
        visitor: {
            Scopable: {
                exit(path, state) {
                    // if(!toplevel && !path.scope.parent) {
                    //     return;
                    // }
                    // if(path.scope.hasEval) {
                    //     return;
                    // }
                    let uid = state.file.get('uid');
                    // 获取所有的便令声明
                    Object.entries(path.scope.bindings).forEach(([key, binding]) => {
                        // mangled 如果处理返回
                        if(binding.mangled) return;
                        binding.mangled = true;
                        // 获取唯一的id
                        const newName = path.scope.generateUid(base54(uid++));
                        // 使用 rename 更改名字
                        binding.path.scope.rename(key, newName)
                    });
                    state.file.set('uid', uid);
                }
            }
        }
    }
});

module.exports = mangle;
