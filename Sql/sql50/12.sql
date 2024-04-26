-- 12. 检索" 01 "课程分数小于 60，按分数降序排列的学生信息
SELECT * FROM student
RIGHT JOIN sc
ON student.SId = sc.SId
WHERE sc.CId = '01' AND sc.score < 60
ORDER BY sc.score DESC
