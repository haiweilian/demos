-- 1.2 查询存在" 01 "课程但可能不存在" 02 "课程的情况(不存在时显示为 null )

-- 以 01 为主临时表连接 02 的临时表
SELECT * FROM (
	(SELECT * FROM result WHERE CId = '01') r1
	LEFT JOIN
	(SELECT * FROM result WHERE CId = '02') r2
	ON r1.SId = r2.SId
)
