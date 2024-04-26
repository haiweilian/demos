-- 1.2 查询存在" 01 "课程但可能不存在" 02 "课程的情况(不存在时显示为 null )
SELECT * FROM
(SELECT * FROM sc WHERE CId = '01') AS t1
LEFT JOIN
(SELECT * FROM sc WHERE CId = '02') AS t2
ON t1.SId = t2.SId
