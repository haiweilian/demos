-- 1. 查询" 01 "课程比" 02 "课程成绩高的学生的信息及课程分数

SELECT * FROM student
RIGHT JOIN
(SELECT t1.SID, s1, s2 FROM
	(SELECT SId, score AS s1 FROM sc WHERE CId = '01') AS t1,
	(SELECT SId, score AS s2 FROM sc WHERE CId = '02') AS t2
	WHERE t1.SId = t2.SId AND s1 > s2
) AS score
ON student.SId = score.SID

-- 知识点
-- FROM/JOIN 不是只可以表名
-- table1, table2 或 table1 CROSS JOIN table2 是交叉联结去两个集合的所有组合

-- 表格名称：
-- SELECT * FROM users;
-- 这会从名为 "users" 的表格中检索所有用户的信息。

-- 视图名称：
-- 假设你有一个名为 "active_users_view" 的视图，你可以这样查询：
-- SELECT * FROM active_users_view;
-- 这将从 "active_users_view" 视图中检索所有活跃用户的信息。

-- 子查询：
-- SELECT * FROM (SELECT * FROM users WHERE age > 18) AS adult_users;
-- 这个查询将从 "users" 表中检索所有年龄大于 18 岁的用户的信息。

-- 表达式：
-- SELECT * FROM (SELECT DISTINCT country FROM users) AS unique_countries;
-- 这个查询将从 "users" 表中检索所有唯一国家的列表。
--
