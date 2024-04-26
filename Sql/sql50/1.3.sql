-- 1.3 查询不存在" 01 "课程但存在" 02 "课程的情况

-- 先查出所有的 02 再判断 01 是否存在
SELECT * FROM sc s1 WHERE CId = '02' AND NOT EXISTS(
	SELECT * FROM sc s2 WHERE CId = '01' AND s1.SId = s2.SId
)

-- 排除所有的 01 再查询 02
SELECT * FROM sc WHERE SId NOT IN(
	SELECT SId FROM sc WHERE CId = '01'
) AND CId = '02'
