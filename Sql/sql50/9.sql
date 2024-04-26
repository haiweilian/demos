-- 9. 查询和" 01 "号的同学学习的课程完全相同的其他同学的信息

SELECT * FROM student WHERE SId IN(
	SELECT SId FROM sc
	GROUP BY SId
	HAVING COUNT(*) = (SELECT COUNT(*) FROM sc WHERE SId = '01')
);

SELECT student.* FROM student
INNER JOIN (SELECT SId FROM sc
	GROUP BY SId
	HAVING COUNT(*) = (SELECT COUNT(*) FROM sc WHERE SId = '01')
) score
ON student.SId = score.SId;
