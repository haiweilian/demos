def reverse(text):
    """字符串反转"""
    return text[::-1]

def is_palindrome(text):
    """判断是否为回文"""
    import re
    clean = re.sub(r'[^a-z0-9]', '', text.lower())
    return clean == clean[::-1]
