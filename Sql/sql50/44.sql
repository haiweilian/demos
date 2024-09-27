-- 44. 查询本月过生日的学生
SELECT * FROM student
WHERE MONTH(Sage) = MONTH(CURDATE())
