-- 33. 成绩不重复，查询选修「张三」老师所授课程的学生中，成绩最高的学生信息及其成绩
SELECT s.*, r.score FROM teacher t
LEFT JOIN course c ON t.TId = c.TId
LEFT JOIN result r ON c.CId = r.CId
LEFT JOIN student s ON r.SId = s.SId
WHERE t.Tname = '张三'
ORDER BY r.score DESC LIMIT 1
