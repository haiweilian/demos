-- 40. 查询各学生的年龄，只按年份来算
SELECT *, YEAR(NOW()) - YEAR(Sage) age FROM student
