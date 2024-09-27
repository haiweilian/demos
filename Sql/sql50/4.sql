-- 4. 查询所有同学的学生编号、学生姓名、选课总数、所有课程的总成绩(没成绩的显示为 null )

-- 关联查询
SELECT s.*, IFNULL(r.count,0) count , r.score FROM student s
LEFT JOIN (
	SELECT SId, COUNT(CId) count, SUM(score) score FROM result r
	GROUP BY r.SId
) r
ON s.SId = r.SId;

-- 在查询结果中使用子查询，查询单个值方便
SELECT s.*,
(SELECT COUNT(r.SId) FROM result r WHERE s.SId = r.SId) count,
(SELECT SUM(r.score) FROM result r WHERE s.SId = r.SId) score
FROM student s;
