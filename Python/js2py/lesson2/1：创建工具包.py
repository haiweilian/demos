# 练习不同的导入方式
from my_utils import add, multiply
import my_utils
from my_utils import add as add_function

print(add(5, 3))                # 8
print(my_utils.multiply(4, 2))  # 8
print(add_function(10, 5))      # 15
