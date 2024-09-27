-- 36. 查询每门功成绩最好的前两名
SELECT * FROM (
	SELECT *,  RANK() OVER(PARTITION BY CId ORDER BY score DESC) `rank` FROM result
) r
WHERE `rank` < 3
