-- 2. 查询平均成绩大于等于 60 分的同学的学生编号和学生姓名和平均成绩

-- 使用聚合函数 GROUP BY 分组，再与学生表关联。
SELECT s.*, r.avgScore FROM
(SELECT SId, AVG(score) avgScore FROM result
	GROUP BY SId HAVING avgScore >= 60
) r
LEFT JOIN student s
ON r.SId = s.SId
