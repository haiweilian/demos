-- 1.1 查询同时存在" 01 "课程和" 02 "课程的情况
SELECT t1.*, t1.score, t2.score FROM
(SELECT * FROM sc WHERE CId = '01') AS t1,
(SELECT * FROM sc WHERE CId = '02') AS t2
WHERE t1.SId = t2.SId
