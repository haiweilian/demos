-- 17. 统计各科成绩各分数段人数：课程编号，课程名称，[100-85]，[85-70]，[70-60]，[60-0] 及所占百分比

SELECT
c.CId,
c.Cname,
COUNT(CASE WHEN r.score >= 85 AND r.score <= 100 THEN 1 END) '[100-85]',
COUNT(CASE WHEN r.score >= 85 AND r.score <= 100 THEN 1 END) / COUNT(r.SId) '[100-85]%',
COUNT(CASE WHEN r.score >= 70 AND r.score < 85 THEN 1 END) '[85-70]',
COUNT(CASE WHEN r.score >= 70 AND r.score < 85 THEN 1 END) / COUNT(r.SId) '[85-70]%',
COUNT(CASE WHEN r.score >= 60 AND r.score < 70 THEN 1 END) '[70-60]',
COUNT(CASE WHEN r.score >= 60 AND r.score < 70 THEN 1 END) / COUNT(r.SId) '[70-60]%',
COUNT(CASE WHEN r.score >= 0 AND r.score < 60 THEN 1 END) '[60-0]',
COUNT(CASE WHEN r.score >= 0 AND r.score < 60 THEN 1 END) / COUNT(r.score) '[60-0]%'
FROM course c
LEFT JOIN result r ON c.CId = r.CId
GROUP BY c.CId, c.Cname;

SELECT
c.CId,
c.Cname,
SUM(IF(r.score >= 85 AND r.score <= 100, 1, 0)) '[100-85]',
SUM(IF(r.score >= 85 AND r.score <= 100, 1, 0)) / COUNT(r.SId) '[100-85]%',
SUM(IF(r.score >= 70 AND r.score < 85, 1, 0)) '[85-70]',
SUM(IF(r.score >= 70 AND r.score < 85, 1, 0)) / COUNT(r.SId) '[85-70]%',
SUM(IF(r.score >= 60 AND r.score < 70, 1, 0)) '[70-60]',
SUM(IF(r.score >= 60 AND r.score < 70, 1, 0)) / COUNT(r.SId) '[70-60]%',
SUM(IF(r.score >= 0 AND r.score < 60, 1, 0)) '[60-0]',
SUM(IF(r.score >= 0 AND r.score < 60, 1, 0)) / COUNT(r.score) '[60-0]%'
FROM course c
LEFT JOIN result r ON c.CId = r.CId
GROUP BY c.CId, c.Cname;
