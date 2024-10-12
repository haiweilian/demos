SET transaction_isolation = 'READ-COMMITTED';
SET transaction_isolation = 'REPEATABLE-READ';

begin;
-- 再开启一个事务T2：主要是查询ID=1的行数据
SELECT * FROM `zz_users` WHERE user_id = 1;

-- 再次在事务T2中查一次ID=1的行数据
SELECT * FROM `zz_users` WHERE user_id = 1;

commit;
