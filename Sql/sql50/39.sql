--
-- 39. 查询选修了全部课程的学生信息
SELECT SId, COUNT(CId) count FROM result
GROUP BY SId
HAVING count = (SELECT COUNT(*) FROM course);
