SELECT * from websites

# LIMIT 查询指定数量的记录

-- MySQL
SELECT * from websites LIMIT 2;
SELECT * from websites LIMIT 2,2; -- 2,2 === 跳过几个,查询几个

-- SQL Server
-- SELECT TOP 2 * FROM websites;

# LIKE 操作符

-- % 通配符替代 0 - 多个字段
SELECT * FROM websites WHERE `name` LIKE 'G%'
SELECT * FROM websites WHERE `name` LIKE '%oo%'
SELECT * FROM websites WHERE `name` NOT LIKE '%oo%'

-- _ 通配符替代 1 个字符
SELECT * FROM websites WHERE `name` LIKE '_oo_le'
SELECT * FROM websites WHERE `name` NOT LIKE '_oo_le'

-- mysql 使用正常正则通配符
SELECT * FROM websites WHERE `name` REGEXP '^g'
SELECT * FROM websites WHERE `name` NOT REGEXP '^g'

# IN 操作符

SELECT * FROM websites WHERE `name` IN('Google', 'Facebook')
SELECT * FROM websites WHERE `name` NOT IN('Google', 'Facebook')

# BETWEEN 操作符
SELECT * FROM access_log WHERE date BETWEEN '2016-05-15' AND '2016-05-17'
SELECT * FROM access_log WHERE date NOT BETWEEN '2016-05-15' AND '2016-05-17'
