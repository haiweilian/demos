-- 2. 查询平均成绩大于等于 60 分的同学的学生编号和学生姓名和平均成绩

-- 使用聚合函数 GROUP BY 分组，再与学生表关联。
SELECT s1.*, avgScore FROM student AS s1
RIGHT JOIN
	(SELECT sc.SId, AVG(sc.score) AS avgScore FROM sc
	GROUP BY sc.SId HAVING avgScore >= 60) s2
ON s1.SId = s2.SId
