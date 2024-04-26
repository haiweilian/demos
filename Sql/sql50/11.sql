-- 11. 查询两门及其以上不及格课程的同学的学号，姓名及其平均成绩

SELECT *,
(SELECT AVG(score) FROM sc WHERE sc.SId = student.SId) score
FROM student WHERE SId IN(
	SELECT SId FROM sc WHERE sc.score < 60 GROUP BY sc.SId HAVING COUNT(*) >= 2
)
