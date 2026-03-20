-- 18. 查询各科成绩前三名的记录

-- 使用 RANK() OVER (PARTITION BY CId ORDER BY score DESC) 进行分组排序，再取前 3

SELECT c.*, r.num, r.score FROM course c
LEFT JOIN
(SELECT *, RANK() OVER (PARTITION BY CId ORDER BY score DESC) num FROM result) r
ON c.CId = r.CId
WHERE r.num <= 3
