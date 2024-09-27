--
-- 38. 检索至少选修两门课程的学生学号
SELECT SId, COUNT(CId) count FROM result
GROUP BY SId
HAVING count >= 2
