-- 13. 按平均成绩从高到低显示所有学生的所有课程的成绩以及平均成绩

SELECT student.Sname, course.Cname, sc.score, avg_score.avg_score FROM student
LEFT JOIN sc
ON student.SId = sc.SId
LEFT JOIN course
ON sc.CId = course.CId
LEFT JOIN (
	SELECT SId, AVG(score) avg_score FROM sc GROUP BY sc.SId
) avg_score
ON student.SId = avg_score.SId
ORDER BY avg_score.avg_score DESC, sc.score DESC
