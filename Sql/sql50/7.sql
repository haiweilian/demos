-- 7. 查询没有学全所有课程的同学的信息
SELECT * FROM sc
SELECT * FROM course;

-- 排除学全的就是没学全的
SELECT * FROM student WHERE student.SId NOT IN(
	SELECT sc.SId FROM sc
		GROUP BY sc.SId
		HAVING COUNT(sc.SId) = (SELECT COUNT(course.CId) FROM course)
)
