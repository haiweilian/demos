# 基础操作
-- 创建数据库
CREATE DATABASE runoob_test;
-- 创建数据表
CREATE TABLE test_1(id INT, name VARCHAR(100));
-- 插入数据
SELECT * FROM test_1;
INSERT INTO test_1 (id, name) VALUES (1, 'lian');

-- 删除数据库
CREATE DATABASE runoob_test_1;
DROP DATABASE IF EXISTS runoob_test_1;
-- 删除表
CREATE TABLE runoob_test_1(id INT, name VARCHAR(100));
DROP TABLE IF EXISTS runoob_test_1;

# 约束

-- NOT NULL 不能为 NULL
CREATE TABLE test_2(id INT NOT NULL);

-- UNIQUE 唯一不能重复
CREATE TABLE test_3(id INT NOT NULL, UNIQUE(id));

-- PRIMARY KEY 主键 不能重复/不能为 NULL
CREATE TABLE test_4(id INT, PRIMARY KEY(id));

-- CHECK 限制列中的值
CREATE TABLE test_5(id INT, CHECK(id > 2));

-- DEFAULT 默认值
CREATE TABLE test_6(name VARCHAR(10) DEFAULT 'l');

-- INDEX 索引
-- 索引可以理解为把设置索引的键为主创建一个map, 查询的时候可以通过值直接获取行
CREATE TABLE test_7(id INT PRIMARY KEY, name VARCHAR(100) NOT NULL);
CREATE INDEX index_name ON test_7(name);
DROP INDEX index_name ON test_7;

-- AUTO_INCREMENT 自定递增
CREATE TABLE test_8(id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100) NOT NULL);


# 特殊值 NULL

-- NULL 不能使用 = 来查询，比如使用以下方法
CREATE TABLE test_9(id INT, name VARCHAR(100));
SELECT * FROM test_9 WHERE name is NULL;
SELECT * FROM test_9 WHERE name is NOT NULL;

-- 处理 null 值的函数 mysql
SELECT id, IFNULL(name,'-') name FROM test_9;
SELECT id, COALESCE(name,'-') name FROM test_9;

