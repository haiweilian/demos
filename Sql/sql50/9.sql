-- 9. 查询和" 01 "号的同学学习的课程完全相同的其他同学的信息
SELECT * FROM student WHERE SId IN(
	SELECT SId FROM result WHERE CId IN(
		SELECT CId FROM result WHERE SId = '01'
	) GROUP BY SId
		HAVING COUNT(*) = (SELECT COUNT(*) FROM result WHERE SId = '01')
)

SELECT * FROM (
	SELECT SId FROM result WHERE CId IN(
		SELECT CId FROM result WHERE SId = '01'
	) GROUP BY SId
	HAVING COUNT(*) = (SELECT COUNT(*) FROM result WHERE SId = '01')
) r
LEFT JOIN student s
ON r.SId = s.SId
