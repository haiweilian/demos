import asyncio
from typing import List

# 异步数据处理练习
async def process_data(data: List[int]) -> List[int]:
    """处理数据"""
    await asyncio.sleep(0.1)  # 模拟处理时间
    return [item * 2 for item in data]

async def filter_data(data: List[int]) -> List[int]:
    """过滤数据"""
    await asyncio.sleep(0.05)  # 模拟过滤时间
    return [item for item in data if item > 10]

async def aggregate_data(data: List[int]) -> int:
    """聚合数据"""
    await asyncio.sleep(0.075)  # 模拟聚合时间
    return sum(data)

async def process_data_pipeline():
    """数据处理管道（顺序处理）"""
    raw_data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

    print("原始数据:", raw_data)

    # 顺序处理
    processed = await process_data(raw_data)
    print("处理后数据:", processed)

    filtered = await filter_data(processed)
    print("过滤后数据:", filtered)

    result = await aggregate_data(filtered)
    print("最终结果:", result)

    return result

async def process_data_concurrently():
    """并发数据处理"""
    raw_data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

    print("原始数据:", raw_data)

    # 并发处理
    processed, filtered, aggregated = await asyncio.gather(
        process_data(raw_data),
        filter_data(raw_data),
        aggregate_data(raw_data)
    )

    print("并发处理结果:", {
        "processed": processed,
        "filtered": filtered,
        "aggregated": aggregated
    })

    return {
        "processed": processed,
        "filtered": filtered,
        "aggregated": aggregated
    }

# 运行练习
async def main():
    print("=== 顺序处理 ===")
    await process_data_pipeline()

    print("\n=== 并发处理 ===")
    await process_data_concurrently()

asyncio.create_task(main())
