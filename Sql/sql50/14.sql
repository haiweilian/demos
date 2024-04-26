-- 14. 查询各科成绩最高分、最低分和平均分：
--     以如下形式显示：课程 ID，课程 name，最高分，最低分，平均分，及格率，中等率，优良率，优秀率
--     及格为>=60，中等为：70-80，优良为：80-90，优秀为：>=90
--     要求输出课程号和选修人数，查询结果按人数降序排列，若人数相同，按课程号升序排列
--

SELECT
	course.CId,
	course.Cname,
	score.num,
	score.max_score,
	score.min_score,
	score.avg_score,
	score.sum,
	score.jgl
FROM course
LEFT JOIN (
	SELECT CId,
	COUNT(DISTINCT SId) num,
	MAX(score) max_score,
	MIN(score) min_score,
	AVG(score) avg_score,
	SUM(score) sum,
	SUM(score >= 60) / COUNT(*) jgl
	FROM sc GROUP BY sc.CId
) as score
ON course.CId = score.CId
ORDER BY score.num DESC , course.CId ASC
