-- 21. 查询男生、女生人数

SELECT Ssex, COUNT(SId) count FROM student
GROUP BY Ssex
