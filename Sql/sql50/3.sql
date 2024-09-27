-- 3. 查询在 SC 表存在成绩的学生信息

-- 查询有成绩的学生id在in
SELECT * FROM student WHERE SId IN(
	SELECT DISTINCT SId FROM result
);

-- 使用 exists 判断改学成有无成绩记录
SELECT * FROM student WHERE EXISTS (
	SELECT SId FROM result WHERE student.SId = result.SId
);

-- 使用 INNER JOIN 学生和成绩都有，再去重
SELECT DISTINCT student.*  FROM student
INNER JOIN result
ON student.SId = result.SId
