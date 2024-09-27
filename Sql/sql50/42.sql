-- 42. 查询本周过生日的学生
SELECT * from student
WHERE WEEKOFYEAR(Sage) = WEEKOFYEAR(CURDATE())
