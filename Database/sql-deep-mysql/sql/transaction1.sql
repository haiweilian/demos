-- 会话级别
SELECT @@transaction_isolation;

SET SESSION transaction_isolation = 'REPEATABLE-READ';

-- 全局级别
SELECT @@global.transaction_isolation;

SET GLOBAL transaction_isolation = 'REPEATABLE-READ';

-- READ-UNCOMMITTED
-- READ-COMMITTED
-- REPEATABLE-READ (MySQL 默认)
-- SERIALIZABLE
