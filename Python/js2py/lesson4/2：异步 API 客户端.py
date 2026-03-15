import aiohttp
import asyncio
from typing import List, Dict, Any

class AsyncAPIClient:
    """异步 API 客户端"""

    def __init__(self, base_url: str):
        self.base_url = base_url

    async def get(self, endpoint: str) -> Dict[str, Any]:
        """GET 请求"""
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{self.base_url}{endpoint}") as response:
                if response.status != 200:
                    raise aiohttp.ClientError(
                        f"HTTP {response.status}: {response.reason}"
                    )
                return await response.json()

    async def post(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """POST 请求"""
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}{endpoint}",
                json=data
            ) as response:
                if response.status != 201:
                    raise aiohttp.ClientError(
                        f"HTTP {response.status}: {response.reason}"
                    )
                return await response.json()

    async def batch_get(self, endpoints: List[str]) -> List[Dict[str, Any]]:
        """批量 GET 请求"""
        async with aiohttp.ClientSession() as session:
            tasks = [
                self._get_with_session(session, endpoint)
                for endpoint in endpoints
            ]
            return await asyncio.gather(*tasks)

    async def _get_with_session(self, session: aiohttp.ClientSession, endpoint: str):
        """使用现有会话的 GET 请求"""
        async with session.get(f"{self.base_url}{endpoint}") as response:
            if response.status != 200:
                raise aiohttp.ClientError(
                    f"HTTP {response.status}: {response.reason}"
                )
            return await response.json()

# 使用 API 客户端
async def test_api_client():
    """测试 API 客户端"""
    client = AsyncAPIClient('https://jsonplaceholder.typicode.com')

    try:
        # 单个请求
        user = await client.get('/users/1')
        print('用户信息:', user)

        # 批量请求
        posts, comments, albums = await client.batch_get([
            '/posts/1',
            '/comments/1',
            '/albums/1'
        ])

        print('批量请求结果:', {
            'posts': posts,
            'comments': comments,
            'albums': albums
        })

        # POST 请求
        new_post = await client.post('/posts', {
            'title': '测试文章',
            'body': '这是测试内容',
            'userId': 1
        })

        print('新文章:', new_post)

    except Exception as error:
        print('API 请求失败:', error)

    # 运行测试
    # 在 Pyodide 环境中，直接调用异步函数
asyncio.create_task(main())
