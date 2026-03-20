-- 12. 检索" 01 "课程分数小于 60，按分数降序排列的学生信息

SELECT s.*, score FROM result r
LEFT JOIN student s
ON r.SId = s.SId
WHERE r.score < 60 AND CId = '01'
ORDER BY score DESC
