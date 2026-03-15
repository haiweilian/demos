def add(a, b):
    """加法函数"""
    return a + b

def multiply(a, b):
    """乘法函数"""
    return a * b

def factorial(n):
    """阶乘函数"""
    if n <= 1:
        return 1
    return n * factorial(n - 1)
