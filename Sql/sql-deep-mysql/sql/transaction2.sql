SELECT * FROM `zz_users`;

-- 开启事务
START TRANSACTION;

-- 修改 ID=4 的姓名为：黑熊
update `zz_users` set `user_name` = "黑熊" where `user_id` = 4;

-- 删除 ID=1 的行数据
delete from `zz_users` where `user_id` = 1;

-- 回滚当前连接中的事务
ROLLBACK;

-- 查看 自动提交事务 是否开启
SHOW VARIABLES LIKE 'autocommit';

SELECT * FROM `zz_users`;
