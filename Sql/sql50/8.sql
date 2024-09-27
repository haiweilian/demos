-- 8. 查询至少有一门课与学号为" 01 "的同学所学相同的同学的信息

SELECT CId FROM result WHERE SId = '01'; -- 学号为 01 学的学科

SELECT * FROM student s WHERE s.SId IN(
	SELECT DISTINCT SId FROM result WHERE CId IN(
		SELECT CId FROM result WHERE SId = '01'
	)
)

SELECT * FROM student s WHERE EXISTS(
	SELECT * FROM result r WHERE s.SId = r.SId AND CId IN(
		SELECT CId FROM result WHERE SId = '01'
	)
)
