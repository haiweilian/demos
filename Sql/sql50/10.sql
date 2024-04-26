-- 10. 查询没学过"张三"老师讲授的任一门课程的学生姓名

SELECT * FROM student WHERE SId NOT IN(
	SELECT sc.SId FROM teacher
		LEFT JOIN course
		ON teacher.TId = course.TId
		LEFT JOIN sc
		ON sc.CId = course.CId
		WHERE teacher.Tname = '张三'
)
