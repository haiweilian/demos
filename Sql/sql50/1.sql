-- 1. 查询" 01 "课程比" 02 "课程成绩高的学生的信息及课程分数

SELECT * FROM result WHERE CId = '01' -- 01的分数
SELECT * FROM result WHERE CId = '02' -- 02的分数

-- 使用交叉联结，数据多时生成的临时表会很大(笛卡尔积)
SELECT * FROM student s
RIGHT JOIN
(SELECT r1.SId SId, r1.score score1, r2.score score2 FROM -- 01、02 组成临时表
	(SELECT * FROM result WHERE CId = '01') r1,
	(SELECT * FROM result WHERE CId = '02') r2
	WHERE r1.SId = r2.SId AND r1.score > r2.score
) r
ON s.SId = r.SId

-- 使用左连接生成临时表优化性能
SELECT * FROM
(SELECT r1.SId SId, r1.score score1, r2.score score2 FROM result r1  -- 01、02 组成临时表
	LEFT JOIN result r2
	ON r1.SId = r2.SId
	WHERE r1.CId = '01' AND r2.CId = '02' AND r1.score > r2.score
) r
LEFT JOIN student s
ON s.SId = r.SId
