'use strict';

module.exports = {
  baseRequest: {
    id: { type: 'string', description: 'id唯一键', required: true, example: '1' },
  },
  baseResponse: {
    code: { type: 'integer', required: true, example: 0 },
    data: { type: 'string', example: null },
    msg: { type: 'string', example: '请求成功' },
  },
};
