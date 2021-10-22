const { declare } = require('@babel/helper-plugin-utils');

const forDirectionLint = declare((api, options, dirname) => {
    api.assertVersion(7);

    return {
        pre(file) {
            file.set('errors', []);
        },
        visitor: {
            ForStatement(path, state) {
                // for (var i = 0; i < 10; i++)
                // = init
                // < test
                // ++ update
                const errors = state.file.get('errors');
                const testOperator = path.node.test.operator
                const udpateOperator = path.node.update.operator;

                let sholdUpdateOperator;
                if (['<', '<='].includes(testOperator)) {
                    // 如果 test '<' | '<=' 那么 udpateOperator 应为 ++
                    sholdUpdateOperator = '++';
                } else if (['>', '>='].includes(testOperator)) {
                    // 如果 test '>', '>=' 那么 udpateOperator 应为 --
                    sholdUpdateOperator = '--';
                }

                // 如果符号不一致，那么久抛出错误
                if (sholdUpdateOperator !== udpateOperator) {
                    const tmp = Error.stackTraceLimit;
                    Error.stackTraceLimit = 0;
                    errors.push(path.get('update').buildCodeFrameError("for direction error", Error));
                    Error.stackTraceLimit = tmp;
                }
            }
        },
        post(file) {
            console.log(file.get('errors'));
        }
    }
});

module.exports = forDirectionLint;
