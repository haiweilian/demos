'use strict';

module.exports = {
  createUserRequest: {
    mobile: { type: 'string', required: true, description: '手机号', example: '18612113873', format: /^1[34578]\d{9}$/ },
    password: { type: 'string', required: true, description: '密码', example: 'Aa123456' },
    realName: { type: 'string', required: true, description: '姓名', example: '连家二少爷' },
  },
};
