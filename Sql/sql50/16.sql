-- 16.  查询学生的总成绩，并进行排名，总分重复时保留名次空缺
-- 16.1 查询学生的总成绩，并进行排名，总分重复时不保留名次空缺

-- 名次空缺
SELECT r.*, RANK() OVER (ORDER BY r.score DESC) num FROM (
	SELECT SId, SUM(score) score FROM result GROUP BY SId
) r

-- 合并名次
SELECT r.*, DENSE_RANK() OVER (ORDER BY r.score DESC) num FROM (
	SELECT SId, SUM(score) score FROM result GROUP BY SId
) r
