-- 15. 按各科成绩进行排序，并显示排名， Score 重复时保留名次空缺
-- 15.1 按各科成绩进行排序，并显示排名， Score 重复时合并名次

SELECT * FROM sc sc1 LEFT JOIN sc sc2 -- 自连接
	ON sc1.CId = sc2.CId AND sc1.score < sc2.score WHERE sc1.CId = '01'; -- 比自己分数高的有几个

-- 15. 按各科成绩进行排序，并显示排名， Score 重复时保留名次空缺
SELECT sc1.SId, sc1.CId, sc1.score, COUNT(sc1.score) num FROM sc sc1 LEFT JOIN sc sc2 -- 自连接
	ON sc1.CId = sc2.CId AND sc1.score < sc2.score -- 比自己分数高的有几个
GROUP BY sc1.SId, sc1.CId, sc1.score
ORDER BY sc1.CId, num;

-- 15.1 按各科成绩进行排序，并显示排名， Score 重复时合并名次
SELECT sc1.SId, sc1.CId, sc1.score, COUNT(sc2.score) + 1 num FROM sc sc1 LEFT JOIN sc sc2 -- 自连接
	ON sc1.CId = sc2.CId AND sc1.score < sc2.score -- 比自己分数高的有几个
GROUP BY sc1.SId, sc1.CId, sc1.score
ORDER BY sc1.CId, num;
