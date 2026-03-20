-- 26. 查询平均成绩大于等于 85 的所有学生的学号、姓名和平均成绩
SELECT s.*, score FROM student s
RIGHT JOIN (
	SELECT SId, AVG(score) score FROM result
	GROUP BY SId
	HAVING score >= 85
) r
ON s.SId = r.SId;
