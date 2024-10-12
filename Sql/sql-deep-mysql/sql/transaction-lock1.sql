-- 开启事务-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- 
START TRANSACTION;

-- 获取共享锁并查询 ID=1 的数据
select * from `zz_users` where user_id = 1 lock in share mode;

-- 在 COMMIT 之前，修改同一数据都会被阻塞, user_id = 1 的会，其他的不会。
COMMIT;


-- 开启事务-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- 
START TRANSACTION;

-- 获取排他锁并查询 ID=1 的数据
select * from `zz_users` where user_id = 1 for update

-- 在 COMMIT 之前，查询同一数据都会被阻塞
COMMIT;


-- 开启事务-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- 
START TRANSACTION;

-- 退化为行锁
-- select * from `zz_users` WHERE user_id = 9 lock in share mode;

-- 获取临键锁并查询 ID<9 的数据
select * from `zz_users` WHERE user_id < 9 lock in share mode;

-- 在 COMMIT 之前，查询同一数据都会被阻塞
COMMIT;

-- 使用 user_
-- next-key lock的规则
-- 原则 1：加锁的基本单位是 next-key lock。next-key lock 是前开后闭区间。
-- 原则 2：只有访问到的对象才会加锁。
-- 优化 1：索引上的等值查询，
-- 命中唯一索，退化为行锁。
-- 命中普通索引，左右两边的GAP Lock + Record Lock。
-- 优化 2：
-- 索引上的等值查询，未命中，所在的Net-Key Lock，退化为GAP Lock 。
-- 索引在范围查询：
-- 1.等值和范围分开判断。
-- 2.索引在范围查询的时候 都会访问到所在区间不满足条件的第一个值为止。
-- 3.如果使用了倒叙排序，按照倒叙排序后，
-- 检索范围的右边多加一个GAP。
-- 哪个方向还有命中的等值判断，再向同方向拓展外开里闭的区间。
