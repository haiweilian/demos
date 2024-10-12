-- 修改 ID=1 的姓名为 猫熊
update `zz_users` set `user_name` = "熊猫" where `user_id` = 1;

-- 查询 ID=1 的信息
select * from `zz_users` where user_id = 1 for update


-- 添加一条数据
INSERT INTO `test_sqldeep`.`zz_users` (`user_id`, `user_name`, `user_sex`, `password`, `register_time`) VALUES (9, '99', '男', '8888', '2024-09-16 07:42:21');

-- 不在临键锁之间(1-9)不会阻塞
INSERT INTO `test_sqldeep`.`zz_users` (`user_id`, `user_name`, `user_sex`, `password`, `register_time`) VALUES (10, '100', '男', '8888', '2024-09-16 07:42:21');

-- 在临键锁之间(1-9)会阻塞
INSERT INTO `test_sqldeep`.`zz_users` (`user_id`, `user_name`, `user_sex`, `password`, `register_time`) VALUES (8, '88', '男', '8888', '2024-09-16 07:42:21');
