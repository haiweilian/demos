https://github.com/bladeXue/sql50?tab=readme-ov-file // SQL 练习题

## FORM 的用法

-- FROM/JOIN 不是只可以表名

-- 表格名称：
-- SELECT \* FROM users;
-- 这会从名为 "users" 的表格中检索所有用户的信息。

-- 视图名称：
-- 假设你有一个名为 "active_users_view" 的视图，你可以这样查询：
-- SELECT \* FROM active_users_view;
-- 这将从 "active_users_view" 视图中检索所有活跃用户的信息。

-- 子查询：
-- SELECT _ FROM (SELECT _ FROM users WHERE age > 18) AS adult_users;
-- 这个查询将从 "users" 表中检索所有年龄大于 18 岁的用户的信息。

-- 表达式：
-- SELECT \* FROM (SELECT DISTINCT country FROM users) AS unique_countries;
-- 这个查询将从 "users" 表中检索所有唯一国家的列表。
--

## 交叉联结

交叉联结（Cross Join）是 它返回两个表中所有可能的组合，即第一个表中的每一行与第二个表中的每一行进行组合。

`SELECT * FROM table1, table2` 或 `SELECT * FROM table1 CROSS JOIN table2`
