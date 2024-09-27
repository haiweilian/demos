-- 32. 求每门课程的学生人数
SELECT CId, COUNT(DISTINCT SId) count FROM result
GROUP BY CId;
