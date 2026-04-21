# 使用线程并发

import concurrent.futures
import urllib.request

URLS = [
    "http://www.foxnews.com/",
    "http://www.cnn.com/",
    "http://europe.wsj.com/",
    "http://www.bbc.co.uk/",
    "http://nonexistent-subdomain.python.org/",
]


# 获取一个页面并报告其 URL 和内容
def load_url(url, timeout):
    with urllib.request.urlopen(url, timeout=timeout) as conn:
        return conn.read()


print("as_completed 完成一个处理一个")
# max_workers 是线程池的大小，即同时执行的最大任务数
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
    # 开始加载操作并以每个 Future 对象的 URL 对其进行标记
    # submit 方法提交一个任务到线程池，返回一个 Future 对象, 参数分别是任务函数和参数列表
    future_to_url = {executor.submit(load_url, url, 60): url for url in URLS}
    # as_completed 谁先执行完成，就先返回谁；按任务的实际完成顺序遍历，而不是提交顺序。
    for future in concurrent.futures.as_completed(future_to_url):
        url = future_to_url[future]
        try:
            data = future.result()
        except Exception as exc:
            print("%r generated an exception: %s" % (url, exc))
        else:
            print("%r page is %d bytes" % (url, len(data)))

print("wait 方法等待所有任务完成再处理")
# 使用 wait 方法等待所有任务完成
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
    future_to_url = {executor.submit(load_url, url, 60): url for url in URLS}

    # 核心：等待 所有任务完成 再继续
    done_futures, not_done_futures = concurrent.futures.wait(
        future_to_url, return_when=concurrent.futures.ALL_COMPLETED  # 等待全部完成
    )

    # 所有任务都完成后，统一处理结果
    for future in done_futures:
        url = future_to_url[future]
        try:
            data = future.result()
        except Exception as exc:
            print("%r generated an exception: %s" % (url, exc))
        else:
            print("%r page is %d bytes" % (url, len(data)))
