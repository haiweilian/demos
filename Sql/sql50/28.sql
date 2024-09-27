-- 28. 查询所有学生的课程及分数情况（存在学生没成绩，没选课的情况）
SELECT * FROM student s
LEFT JOIN result r
ON s.SId = r.SId
