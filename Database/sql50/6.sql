-- 6. 查询学过「张三」老师授课的同学的信息

SELECT TId FROM teacher WHERE TName = '张三'; -- 1.张三老师id
SELECT CId FROM course WHERE TId = '01'; -- 2.张三老师的学科
SELECT SId FROM result WHERE CId = '02'; -- 3.考过此学科的学生
SELECT * FROM student WHERE SId = '03'; -- 4.学生信息

SELECT * FROM teacher t
LEFT JOIN course c ON t.TId = c.CId
LEFT JOIN result r ON c.CId = r.CId
LEFT JOIN student s ON r.SId = s.SId
WHERE t.Tname = '张三';
