# 别名简化名称，使用 AS 或直接跟名称

-- 列别名
SELECT name n, country AS c FROM websites

-- 表别名
SELECT w.name FROM websites w WHERE w.name = 'Google'
SELECT w.name FROM websites AS w WHERE w.name = 'Google'

# INNER JOIN
-- INNER JOIN 关键字在表中存在至少一个匹配时返回行。如果 "Websites" 表中的行在 "access_log" 中没有匹配，则不会列出这些行。
SELECT * FROM websites;
SELECT * FROM access_log;
SELECT * FROM websites w INNER JOIN access_log a ON w.id = a.site_id;

# LEFT JOIN
-- LEFT JOIN 关键字从左表（Websites）返回所有的行，即使右表（access_log）中没有匹配。
SELECT * FROM websites;
SELECT * FROM access_log;
SELECT * FROM websites w LEFT JOIN access_log a ON w.id = a.site_id;

# RIGHT JOIN
INSERT INTO `access_log` (`aid`, `site_id`, `count`, `date`) VALUES ('10', '99', '111', '2016-03-09');

-- RIGHT JOIN 关键字从右表（access_log）返回所有的行，即使左表（Websites）中没有匹配。
SELECT * FROM websites;
SELECT * FROM access_log;
SELECT * FROM websites w RIGHT JOIN access_log a ON w.id = a.site_id;

# FULL JOIN  ---- MySql 不支持
-- FULL OUTER JOIN 关键字返回左表（Websites）和右表（access_log）中所有的行。如果 "Websites" 表中的行在 "access_log" 中没有匹配或者 "access_log" 表中的行在 "Websites" 表中没有匹配，也会列出这些行。
-- SELECT * FROM websites;
-- SELECT * FROM access_log;
-- SELECT * FROM websites w FULL OUTER JOIN access_log a ON w.id = a.site_id;

# UNION UNION ALL

-- 合并两个表数据
SELECT * FROM websites;
SELECT * FROM apps;
-- UNION 会合并重复值，UNION ALL 返回所有
SELECT websites.country, websites.`name` FROM websites
UNION
SELECT apps.country, apps.app_name FROM apps;


