-- CREATE TABLE zz_users (
--     user_id INT PRIMARY KEY,
--     user_name VARCHAR(100),
--     user_sex CHAR(1),
--     password VARCHAR(100),
--     register_time DATETIME
-- );
--
-- INSERT INTO zz_users (user_id, user_name, user_sex, password, register_time) VALUES
-- (1, '熊猫', '女', '6666', '2022-08-14 15:22:01'),
-- (2, '竹子', '男', '1234', '2022-09-14 16:17:44'),
-- (3, '子竹', '男', '4321', '2022-09-16 07:42:21');
--
-- ALTER TABLE `zz_users` ADD PRIMARY KEY `p_user_id`(`user_id`);
-- ALTER TABLE `zz_users` ADD KEY `unite_index`(`user_name`,`user_sex`,`password`);
--

SHOW INDEX FROM zz_users;

EXPLAIN SELECT * FROM `zz_users` WHERE user_id = 1;

EXPLAIN SELECT * FROM `zz_users` WHERE user_id = 1 OR user_name = "熊猫";

EXPLAIN SELECT * FROM `zz_users` WHERE user_name LIKE "熊%";

EXPLAIN SELECT * FROM `zz_users` WHERE user_name LIKE "%熊";

EXPLAIN SELECT * FROM `zz_users` WHERE user_name = 111;

EXPLAIN SELECT * FROM `zz_users` WHERE user_id - 1 = 1;

EXPLAIN SELECT * FROM `zz_users` WHERE SUBSTRING(user_name,0,1) = "竹子";

EXPLAIN SELECT * FROM `zz_users` WHERE `user_sex` = "男" AND `password` = "1234";

EXPLAIN SELECT * FROM `zz_users` WHERE user_name = user_sex;

EXPLAIN SELECT * FROM `zz_users` WHERE user_id IN(1,2);

EXPLAIN SELECT * FROM `zz_users` WHERE user_id NOT IN(1,2);

EXPLAIN SELECT
    `user_name`,`user_sex`
FROM
    `zz_users`
WHERE
    `password` = "1234" AND `user_sex` = "男";
