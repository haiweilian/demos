-- 15. 按各科成绩进行排序，并显示排名， Score 重复时保留名次空缺
-- 15.1 按各科成绩进行排序，并显示排名， Score 重复时合并名次

SELECT * FROM result r1
LEFT JOIN result r2
ON r1.CId = r2.CId AND r2.score > r1.score
WHERE r1.CId = '01' -- 每位学生连接比自己分数大的

-- 名次空缺
SELECT r1.SId, r1.CId, r1.score, COUNT(r2.score) + 1 num FROM result r1
LEFT JOIN result r2
ON r1.CId = r2.CId AND r1.score < r2.score
GROUP BY r1.SId, r1.CId, r1.score
ORDER BY CId, num

-- 合并名次
SELECT r1.SId, r1.CId, r1.score, COUNT(DISTINCT r2.score) + 1 num FROM result r1
LEFT JOIN result r2
ON r1.CId = r2.CId AND r1.score < r2.score
GROUP BY r1.SId, r1.CId, r1.score
ORDER BY CId, num
