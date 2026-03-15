# 函数式编程练习
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# 1. 找出所有偶数的平方
even_squares = [x ** 2 for x in numbers if x % 2 == 0]

# 2. 计算所有奇数的和
odd_sum = sum(x for x in numbers if x % 2 == 1)

# 3. 找出所有大于5的数的立方
large_cubes = [x ** 3 for x in numbers if x > 5]

print("偶数的平方:", even_squares)
print("奇数的和:", odd_sum)
print("大于5的数的立方:", large_cubes)

# 使用函数式方法
from functools import reduce

even_squares_func = list(map(lambda x: x ** 2, filter(lambda x: x % 2 == 0, numbers)))
odd_sum_func = reduce(lambda acc, x: acc + x, filter(lambda x: x % 2 == 1, numbers), 0)
large_cubes_func = list(map(lambda x: x ** 3, filter(lambda x: x > 5, numbers)))

print("函数式方法 - 偶数的平方:", even_squares_func)
print("函数式方法 - 奇数的和:", odd_sum_func)
print("函数式方法 - 大于5的数的立方:", large_cubes_func)
