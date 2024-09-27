-- 20. 查询出只选修两门课程的学生学号和姓名
SELECT * FROM student WHERE SId IN(
	SELECT SId FROM result
	GROUP BY SId
	HAVING COUNT(SId) = 2
);

SELECT s.* FROM (
	SELECT SId FROM result
	GROUP BY SId
	HAVING COUNT(SId) = 2
) r
LEFT JOIN student s
ON r.SId = s.SId
