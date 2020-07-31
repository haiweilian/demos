'use strict';

/**
 * 统一错误处理
 * @param {*} option option
 * @param {*} app app
 */
module.exports = (option, app) => {
  return async function(ctx, next) {
    try {
      await next();
    } catch (err) {
      // 所有的异常都在 app 上触发一个 error 事件，框架会记录一条错误日志
      app.emit('error', err, this);

      // 如果自定义了状态则使用默认
      // 服务端自身的处理逻辑错误(包含框架错误500 及 自定义业务逻辑错误533开始 ) 客户端请求参数导致的错误(4xx开始)，设置不同的状态码
      const status = err.status || 500;

      // 生产环境时 500 错误的详细错误内容不返回给客户端，因为可能包含敏感信息
      const errors = status === 500 && app.config.env === 'prod' ? 'Internal Server Error' : err.message;

      // 是否自定义错误详情
      const detail = status === 422 ? err.errors : void 0;

      // 读出各个属性，设置到响应中
      ctx.helper.error({
        ctx,
        code: status,
        msg: errors,
        detail,
      });
    }
  };
};
