-- 8. 查询至少有一门课与学号为" 01 "的同学所学相同的同学的信息
SELECT * FROM student WHERE SId IN(
	SELECT DISTINCT SId FROM sc WHERE CId IN(
		SELECT CId FROM sc WHERE SId = '01'
	)
)
