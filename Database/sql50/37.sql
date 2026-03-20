--
-- 37. 统计每门课程的学生选修人数（超过 5 人的课程才统计）。
SELECT CId, COUNT(SId) count FROM result
GROUP BY CId
HAVING count >= 5
