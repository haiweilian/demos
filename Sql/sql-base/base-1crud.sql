# SELECT 查询

-- 查询全部
SELECT * FROM websites;

-- 查询具体列
SELECT name, country FROM websites;

-- 查询结果去重
SELECT DISTINCT country FROM websites;

# WHERE 过滤

-- 根据条件过滤记录
SELECT * FROM websites WHERE id = 1
SELECT * FROM websites WHERE country = 'CN'
SELECT * FROM websites WHERE id > 2
SELECT * FROM websites WHERE id BETWEEN 3 AND 5

-- 根据运算符过滤记录
SELECT * FROM websites WHERE alexa > 20 AND country = 'CN'
SELECT * FROM websites WHERE country = 'CN' OR country = 'USA'
SELECT * FROM websites WHERE alexa > 20 AND (country = 'CN' OR country = 'USA')

-- 根据字段排序记录
SELECT * FROM websites ORDER BY alexa
SELECT * FROM websites ORDER BY alexa DESC
SELECT * FROM websites ORDER BY alexa, country

# INSERT INTO 插入

-- 插入新行
INSERT INTO websites (name, url, alexa, country) VALUES ('百度', 'https://baidu.com', 50, 'CN');
INSERT INTO websites VALUES (99, '百度', 'https://baidu.com', 50, 'CN'); -- 不指定名称需要传入全部字段

# UPDATE 更新
UPDATE websites SET name='百度1', alexa = 100 WHERE id = 99

# DELETE FROM 删除
DELETE FROM websites WHERE id = 99
