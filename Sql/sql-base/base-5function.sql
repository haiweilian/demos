SELECT * FROM access_log;

-- AVG 返回平均值
SELECT AVG(count) avg FROM access_log;

-- COUNT 统计个数
SELECT Count(*) from access_log;
SELECT Count(aid) from access_log;
SELECT Count(DISTINCT site_id) from access_log;

-- MAX 最大值
SELECT MAX(count) FROM access_log;

-- MIN 最小值
SELECT MIN(count) FROM access_log;

-- SUM 合计
SELECT SUM(count) FROM access_log;

-- 转大写
SELECT UCASE(name) FROM websites;

-- 转小写
SELECT LCASE(name) FROM websites;

-- 从字符串中提取文本
SELECT MID(url,1,5) FROM websites;

-- 返回字符串文本长度
SELECT LENGTH(url) FROM websites;

-- 四舍五入
SELECT name, ROUND(1.322, 2) FROM websites;

-- 当前时间
SELECT name, NOW() FROM websites;
SELECT name, DATE_FORMAT(NOW(),'%Y-%m-%d') FROM websites;

-- GROUP BY 分组
-- GROUP BY 语句用于结合聚合函数，根据一个或多个列对结果集进行分组。

-- 根据 site_id 分组并对组中的 count 求和。
SELECT site_id, SUM(count) AS nums FROM access_log GROUP BY site_id;

-- 先关联查询，根据名称分组并对组中的 count 求和
SELECT name, SUM(access_log.count) FROM websites
LEFT JOIN access_log
ON websites.id = access_log.site_id
GROUP BY websites.name

-- HAVING
-- WHERE 无法对 GROUP BY 分组后的数据使用，需要使用 HAVING 子句。
-- 1.where在group by前， having在group by 之后
-- 2.聚合函数（avg、sum、max、min、count），不能作为条件放在where之后，但可以放在having之后
SELECT name, SUM(access_log.count) sum FROM websites
LEFT JOIN access_log
ON websites.id = access_log.site_id
GROUP BY websites.name
HAVING sum > 200;

-- EXISTS 判断子查询是否有记录，如果有一条或多条记录存在返回 True，否则返回 False。
SELECT * FROM websites;
SELECT * from access_log;
SELECT * FROM websites WHERE EXISTS(SELECT * from access_log WHERE count > 200 AND websites.id = access_log.site_id)
SELECT * FROM websites WHERE NOT EXISTS(SELECT * from access_log WHERE count > 200 AND websites.id = access_log.site_id)
