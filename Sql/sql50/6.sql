-- 6. 查询学过「张三」老师授课的同学的信息

SELECT * FROM teacher WHERE Tname = '张三'

SELECT * FROM course WHERE TId = '01'

SELECT * FROM sc WHERE CId = '02'

-- 先查出 张三 授课的科目
-- 再查出上过此科目的学生
-- 最后再查出学生信息
SELECT * FROM student WHERE SId IN(
	SELECT sc.SId FROM teacher
	LEFT JOIN course -- 关联课程表查询课程id
	ON teacher.TId = course.TId
	LEFT JOIN sc -- 关联分数表查询学生id
	ON course.CId = sc.CId
	WHERE teacher.Tname = '张三'
)

SELECT student.* FROM teacher
	LEFT JOIN course
	ON teacher.TId = course.TId
	LEFT JOIN sc
	ON course.CId = sc.CId
	RIGHT JOIN student
	ON sc.SId = student.SId
	WHERE teacher.Tname = '张三'
