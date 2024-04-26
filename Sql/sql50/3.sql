-- 3. 查询在 SC 表存在成绩的学生信息

-- 使用 IN 查询存在程序的学生
SELECT * FROM student WHERE SId IN(SELECT DISTINCT SId FROM sc);

-- 使用 EXISTS 判断学生是否存在分数
SELECT * FROM student WHERE EXISTS(SELECT SId FROM sc WHERE sc.SId = student.SId);

-- 使用联结，DBMS对联结有查询优化
SELECT DISTINCT student.* FROM student, sc WHERE student.SId = sc.SId
