-- 31. 查询课程编号为 01 且课程成绩在 80 分以上的学生的学号和姓名
SELECT s.* FROM student s
LEFT JOIN result r
ON s.SId = r.SId
WHERE r.score >= 80 AND r.CId = '01'
