-- 40. 查询各学生的年龄，只按年份来算
SELECT Sname, (YEAR(NOW()) - YEAR(Sage)) Age FROM student
