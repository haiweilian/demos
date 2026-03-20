-- 先查询一次用户表
SELECT * FROM `zz_users`;

-- 开启事务
start transaction;

-- 修改 ID=4 的姓名为：黑熊
update `zz_users` set `user_name` = "黑熊" where `user_id` = 4;

-- 添加一个事务回滚点：update_name
savepoint update_name;

-- 删除 ID=1 的行数据
delete from `zz_users` where `user_id` = 1;

-- 回滚到 update_name 这个事务点
rollback to update_name;

-- 再次查询一次数据
SELECT * FROM `zz_users`;

-- 提交事务
COMMIT;
