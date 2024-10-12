SET transaction_isolation = 'READ-COMMITTED';
SET transaction_isolation = 'REPEATABLE-READ';

-- 开启一个事务T1：主要是修改两次ID=1的行数据
begin;
UPDATE `zz_users` SET user_name = "熊猫1" WHERE user_id = 1;
UPDATE `zz_users` SET user_sex = "男" WHERE user_id = 1;

-- 此时先提交事务T1
commit;
