https://github.com/bladeXue/sql50?tab=readme-ov-file // SQL 练习题，只看题目不看答案，答案比较老
https://dev.mysql.com/doc/refman/8.0/en/built-in-function-reference.html // 官方文档

## FORM 的用法

```
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
```

## 交叉联结

交叉联结（Cross Join）是 它返回两个表中所有可能的组合，即第一个表中的每一行与第二个表中的每一行进行组合。

`SELECT * FROM table1, table2` 或 `SELECT * FROM table1 CROSS JOIN table2`

## 子查询

SQL 子查询是一种在主查询中嵌套另一个查询的技术，用于通过另一个查询的结果来筛选数据。子查询可以出现在 `SELECT`、`FROM`、`WHERE`、`HAVING` 等子句中。子查询通常分为以下几类：

1. **标量子查询（Scalar Subquery）** 返回单个值的子查询，通常用于 `SELECT` 或 `WHERE` 子句中。

```sql
SELECT name, (SELECT AVG(salary) FROM employees) AS avg_salary
FROM employees;
```

在这个例子中，子查询返回了所有员工的平均薪资，作为一个单独的列 `avg_salary`。

2. **多行子查询（Multi-row Subquery）** 返回多行结果，通常结合 `IN`、`ANY`、`ALL` 这样的运算符使用。

```sql
SELECT name
FROM employees
WHERE department_id IN (SELECT department_id FROM departments WHERE location = 'New York');
```

这里的子查询返回所有位于“New York”的部门，主查询从这些部门中检索员工姓名。

3. **相关子查询（Correlated Subquery）** 子查询依赖于外部查询中的一列或多列，通常会在每一行中执行。

```sql
SELECT name
FROM employees e1
WHERE salary > (SELECT AVG(salary) FROM employees e2 WHERE e1.department_id = e2.department_id);
```

在这个例子中，子查询依赖于主查询中的 `department_id`，用于比较每个员工的薪水是否高于其所在部门的平均薪水。

4. **EXISTS 子查询** 用于检查子查询是否返回结果。如果有结果返回，则为 `TRUE`，否则为 `FALSE`。

```sql
SELECT name
FROM employees e
WHERE EXISTS (SELECT 1 FROM departments d WHERE e.department_id = d.department_id AND d.location = 'New York');
```

这里，`EXISTS` 子查询用于确定员工是否属于位于“New York”的部门。

## CASE 表达式

`CASE WHEN` 是 SQL 中用于条件判断的一个表达式。它类似于编程语言中的 `if-else` 语句，允许你根据特定条件返回不同的值。通常用在 `SELECT` 语句中，但也可以用于 `UPDATE`、`DELETE` 等操作。语法分为两种：**简单 CASE** 和 **搜索型 CASE**。

### 简单 CASE 表达式

```sql
SELECT
    column_name,
    CASE column_name
        WHEN value1 THEN result1
        WHEN value2 THEN result2
        ELSE result_default
    END AS alias_name
FROM table_name;
```

**解释**：

- 如果 `column_name` 的值是 `value1`，则返回 `result1`。
- 如果是 `value2`，则返回 `result2`。
- 如果没有匹配项，则返回 `result_default`。

**示例**：

```sql
SELECT product_id,
       CASE product_category
           WHEN 'Electronics' THEN 'Tech'
           WHEN 'Clothing' THEN 'Apparel'
           ELSE 'Other'
       END AS category_group
FROM products;
```

### 搜索型 CASE 表达式

```sql
SELECT
    column_name,
    CASE
        WHEN condition1 THEN result1
        WHEN condition2 THEN result2
        ELSE result_default
    END AS alias_name
FROM table_name;
```

**解释**：

- `CASE` 后直接跟 `WHEN` 语句，`WHEN` 中写的是条件表达式。
- 根据条件的真假返回对应的结果。

**示例**：

```sql
SELECT order_id,
       CASE
           WHEN total_amount > 1000 THEN 'High'
           WHEN total_amount BETWEEN 500 AND 1000 THEN 'Medium'
           ELSE 'Low'
       END AS order_value_category
FROM orders;
```

### 结合其他 SQL 语句

你可以将 `CASE WHEN` 用在 `WHERE`、`GROUP BY`、`HAVING` 等语句中。例如：

```sql
SELECT
    COUNT(*),
    CASE
        WHEN total_amount > 1000 THEN 'High Value Orders'
        ELSE 'Other Orders'
    END
FROM orders
GROUP BY CASE
             WHEN total_amount > 1000 THEN 'High Value Orders'
             ELSE 'Other Orders'
         END;
```

`CASE WHEN` 非常灵活，用于处理不同的查询场景。
