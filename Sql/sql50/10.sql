-- 10. 查询没学过"张三"老师讲授的任一门课程的学生姓名

SELECT * FROM student WHERE SId NOT IN(
	SELECT r.SId FROM teacher t
	LEFT JOIN course c
	ON t.TId = c.TId
	LEFT JOIN result r
	ON c.CId = r.CId
	WHERE t.Tname = '张三'
);
