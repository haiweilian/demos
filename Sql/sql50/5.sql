-- 5. 查询「李」姓老师的数量

-- 使用 LIKE 操作符，使用 % 占位符
SELECT COUNT(*) count FROM teacher WHERE Tname LIKE '李%'
