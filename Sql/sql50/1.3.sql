-- 1.3 查询不存在" 01 "课程但存在" 02 "课程的情况

-- 查出 02 课程的学生，再判断改学生没有 01 课程
SELECT * FROM result r1 WHERE r1.CId = '02' AND NOT EXISTS(
 SELECT * FROM result r2 WHERE r2.CId = '01' AND r1.SId = r2.SId
)

-- 查出 02 课程的学生，再排除有 01 课程的学生
SELECT * FROM result r1 WHERE r1.CId = '02' AND r1.SId NOT IN(
	SELECT SId FROM result r2 WHERE r2.CId = '01'
)
