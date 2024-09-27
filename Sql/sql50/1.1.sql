-- 1.1 查询同时存在" 01 "课程和" 02 "课程的情况
SELECT * FROM result r1
LEFT JOIN result r2
ON r1.SId = r2.SId
WHERE r1.CId = '01' AND r2.CId = '02';
