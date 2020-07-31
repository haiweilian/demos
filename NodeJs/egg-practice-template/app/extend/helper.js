'use strict';
// ========================================================================
// == 辅助函数，通过 ctx.helper.xxx 调用
// =============================================================================

/**
 * 统一处理成功返回格式
 * @param {Object} param0 ctx、res、msg
 */
exports.success = ({ ctx, res = null, msg = '成功' }) => {
  ctx.status = 200;
  ctx.body = {
    code: 0,
    data: res,
    msg,
  };
};

/**
 * 统一处理失败返回格式
 * @param {Object} param0 ctx、code、msg
 */
exports.error = ({ ctx, code = 500, msg = '失败', detail }) => {
  ctx.status = 200;
  ctx.body = {
    code,
    msg,
    detail,
  };
};
