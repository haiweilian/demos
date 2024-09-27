-- 29. 查询任何一门课程成绩在 70 分以上的姓名、课程名称和分数
--
SELECT s.SId, s.Sname, c.Cname, r.score FROM course c
LEFT JOIN result r
ON c.CId = r.CId AND r.score > 70
LEFT JOIN student s
ON r.SId = s.SId
