-- 13. 按平均成绩从高到低显示所有学生的所有课程的成绩以及平均成绩

SELECT s.*, c.Cname, r1.score, r2.avgScore  FROM student s
LEFT JOIN result r1
ON s.SId = r1.SId
LEFT JOIN course c
ON r1.CId = c.CId
LEFT JOIN (
	SELECT SId, AVG(score) avgScore FROM result GROUP BY SId
) r2
ON s.SId = r2.SId
ORDER BY r2.avgScore DESC, r1.score DESC
