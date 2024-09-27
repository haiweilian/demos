-- 35. 查询不同课程成绩相同的学生的学生编号、课程编号、学生成绩
SELECT DISTINCT r1.* FROM result r1
INNER JOIN result r2
ON r1.score = r2.score
WHERE r1.SId != r2.SId
