numbers = [1, 2, 3, 4, 5]
doubled = [x * 2 for x in numbers] # 列表推导式语法
even_numbers = [x for x in doubled if x % 2 == 0] # 列表推导式语法
sum_even = sum(even_numbers)
print(sum_even)
