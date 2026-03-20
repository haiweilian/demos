-- 11. 查询两门及其以上不及格课程的同学的学号，姓名及其平均成绩

-- 不及格
SELECT SId FROM result WHERE score < 60
GROUP BY SId
HAVING COUNT(*) >= 2;

-- 平均分
SELECT SId, AVG(score) avgScore FROM result
GROUP BY SId;

--
SELECT s.*, r2.avgScore FROM
(
	SELECT SId FROM result WHERE score < 60
	GROUP BY SId
	HAVING COUNT(*) >= 2
) r1
LEFT JOIN
(
	SELECT SId, AVG(score) avgScore FROM result
	GROUP BY SId
) r2
ON r1.SId = r2.SId
LEFT JOIN student s
ON r1.SId = s.SId;

-- 嵌套子查询性能不好
SELECT
s.*,
(SELECT AVG(score) FROM result WHERE SId = s.SId) avgScore
FROM student s WHERE SId IN(
	SELECT SId FROM result WHERE score < 60
	GROUP BY SId
	HAVING COUNT(*) >= 2
)
