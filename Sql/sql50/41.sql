-- 41. 按照出生日期来算，当前月日 < 出生年月的月日则，年龄减一
-- 使用 TIMESTAMPDIFF 函数会对比两个时间，不足时向下取
SELECT *, TIMESTAMPDIFF(YEAR,Sage, NOW()) age FROM student;
