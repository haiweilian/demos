-- 23. 查询同名同性学生名单，并统计同名人数
SELECT Sname, Ssex, COUNT(SId) count FROM student
GROUP BY Sname, Ssex
