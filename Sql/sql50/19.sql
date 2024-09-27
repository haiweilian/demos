-- 19. 查询每门课程被选修的学生数

SELECT c.CId, c.Cname, COUNT(r.SId) count FROM course c
LEFT JOIN result r
ON c.CId = r.CId
GROUP BY c.CId, c.CName
