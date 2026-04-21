# 使用进程并发

import concurrent.futures
import math
import urllib.request

URLS = [
    "http://www.foxnews.com/",
    "http://www.cnn.com/",
    "http://europe.wsj.com/",
    "http://www.bbc.co.uk/",
    "http://nonexistent-subdomain.python.org/",
]


# 获取一个页面并报告其 URL 和内容
# 修复1：添加请求头，解决403反爬
def load_url(url, timeout):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout) as conn:
        return conn.read()


PRIMES = [
    112272535095293,
    112582705942171,
    112272535095293,
    115280095190773,
    115797848077099,
    1099726899285419,
]


def is_prime(n):
    if n < 2:
        return False
    if n == 2:
        return True
    if n % 2 == 0:
        return False

    sqrt_n = int(math.floor(math.sqrt(n)))
    for i in range(3, sqrt_n + 1, 2):
        if n % i == 0:
            return False
    return True


# 修复2：进程池【必须】把所有执行代码放在这里！
if __name__ == "__main__":

    print("进程用来执行大量计算任务")
    with concurrent.futures.ProcessPoolExecutor() as executor:
        for number, prime in zip(PRIMES, executor.map(is_prime, PRIMES)):
            print("%d is prime: %s" % (number, prime))

    print("as_completed 完成一个处理一个")
    # max_workers 是进程池的大小
    with concurrent.futures.ProcessPoolExecutor(max_workers=5) as executor:
        future_to_url = {executor.submit(load_url, url, 60): url for url in URLS}
        for future in concurrent.futures.as_completed(future_to_url):
            url = future_to_url[future]
            try:
                data = future.result()
            except Exception as exc:
                print("%r generated an exception: %s" % (url, exc))
            else:
                print("%r page is %d bytes" % (url, len(data)))

    print("\nwait 方法等待所有任务完成再处理")
    # 使用 wait 方法等待所有任务完成
    with concurrent.futures.ProcessPoolExecutor(max_workers=5) as executor:
        future_to_url = {executor.submit(load_url, url, 60): url for url in URLS}

        done_futures, not_done_futures = concurrent.futures.wait(
            future_to_url, return_when=concurrent.futures.ALL_COMPLETED
        )

        for future in done_futures:
            url = future_to_url[future]
            try:
                data = future.result()
            except Exception as exc:
                print("%r generated an exception: %s" % (url, exc))
            else:
                print("%r page is %d bytes" % (url, len(data)))
