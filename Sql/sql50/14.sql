-- 14. 查询各科成绩最高分、最低分和平均分：
--
--     以如下形式显示：课程 ID，课程 name，最高分，最低分，平均分，及格率，中等率，优良率，优秀率
--     及格为>=60，中等为：70-80，优良为：80-90，优秀为：>=90
--     要求输出课程号和选修人数，查询结果按人数降序排列，若人数相同，按课程号升序排列

SELECT c.*, r.* FROM course c
LEFT JOIN
(
SELECT CId,
COUNT(CId) count,
MAX(score) maxScore,
MIN(score) minScore,
AVG(score) avgScore,
(COUNT(CASE WHEN score >= 60 THEN 1 END) / COUNT(*)) * 100 s1,
(COUNT(CASE WHEN score >= 70 AND score < 80 THEN 1 END) / COUNT(*)) * 100 s2,
(COUNT(CASE WHEN score >= 80 AND score < 90 THEN 1 END) / COUNT(*)) * 100 s3,
(COUNT(CASE WHEN score >= 90 THEN 1 END) / COUNT(*)) * 100 s4
FROM result GROUP BY CId
) r
ON c.CId = r.CId
ORDER BY r.count DESC, c.CId DESC;

