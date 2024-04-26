-- 4. 查询所有同学的学生编号、学生姓名、选课总数、所有课程的总成绩(没成绩的显示为 null )

-- 先查询出学生，再用子查询课程和分数
SELECT
student.SId,
student.Sname,
(SELECT COUNT(sc.CId) FROM sc WHERE sc.SId = student.SId) count,
(SELECT IFNULL(SUM(sc.score),0) FROM sc WHERE sc.SId = student.SId) score
FROM student

-- 查询一个子表，再关联查询
SELECT
student.*,
IFNULL(score.count,0),
IFNULL(score.score,0)
FROM student
LEFT JOIN (
	SELECT SId, COUNT(CId) count, SUM(score) score FROM sc GROUP BY SId
) AS score
ON student.SId = score.SId
