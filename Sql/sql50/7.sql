-- 7. 查询没有学全所有课程的同学的信息
SELECT * FROM sc
SELECT * FROM course;

-- 排除学全的就是没学全的
SELECT * FROM student s WHERE s.SId NOT IN(
	SELECT r.SId FROM result r
	GROUP BY r.SId
	HAVING COUNT(r.SId) = (SELECT COUNT(*) count FROM course)
)

-- 连接查询，选择 r.SId 为 NULL 的学生
SELECT * FROM student s
LEFT JOIN (
	SELECT r.SId FROM result r
	GROUP BY r.SId
	HAVING COUNT(r.SId) = (SELECT COUNT(*) count FROM course)
) r
ON s.SId = r.SId WHERE r.SId IS NULL
