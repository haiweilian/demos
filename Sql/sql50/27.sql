-- 27. 查询课程名称为「数学」，且分数低于 60 的学生姓名和分数
SELECT s.SId, s.Sname, r.score FROM course c
LEFT JOIN result r
ON c.CId = r.CId AND r.score < 60
LEFT JOIN student s
ON r.SId = s.SId
WHERE c.Cname = '数学'
