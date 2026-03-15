import asyncio
from contextlib import asynccontextmanager

# Python 异步上下文管理器
class AsyncResource:
    """异步资源类"""

    def __init__(self, name):
        self.name = name
        self.is_open = False

    async def __aenter__(self):
        """进入上下文"""
        print(f"打开资源: {self.name}")
        self.is_open = True
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """退出上下文"""
        print(f"关闭资源: {self.name}")
        self.is_open = False

    async def use(self):
        """使用资源"""
        if not self.is_open:
            raise RuntimeError("资源未打开")
        print(f"使用资源: {self.name}")
        await asyncio.sleep(1)

# 使用异步上下文管理器
async def use_resource():
    """使用异步资源"""
    async with AsyncResource("数据库连接") as resource:
        await resource.use()

# 使用装饰器创建异步上下文管理器
@asynccontextmanager
async def managed_resource(name):
    """管理的资源上下文管理器"""
    print(f"打开资源: {name}")
    try:
        yield name
    finally:
        print(f"关闭资源: {name}")

async def use_managed_resource():
    """使用管理的资源"""
    async with managed_resource("文件连接") as resource:
        print(f"使用资源: {resource}")
        await asyncio.sleep(1)

# 运行示例
async def main():
    await use_resource()
    await use_managed_resource()

# 在 Pyodide 环境中，直接调用异步函数
# asyncio.create_task(main())

# 如果是直接运行，使用 asyncio.run(main())
if __name__ == "__main__":
    asyncio.run(main())
