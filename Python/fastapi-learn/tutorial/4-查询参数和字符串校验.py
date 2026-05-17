from typing import Annotated

from fastapi import FastAPI, Query
from pydantic import AfterValidator

app = FastAPI()


# Annotated 是一个类型注解，用于在类型上添加元数据
# Query 是一个查询参数的装饰器，用于指定查询参数的元数据，比如最大长度
@app.get("/items/")
async def read_items(
    q: Annotated[
        str | None,
        Query(
            min_length=3,
            max_length=50,
            title="Query string",
            description="Query string",
            # 等等参数
        ),
    ] = None,
):
    results = {"items": [{"item_id": "Foo"}, {"item_id": "Bar"}]}
    if q:
        results.update({"q": q})
    return results


# 自定义校验
# 使用 AfterValidator 或 BeforeValidator 实现
def check_valid_id(id: str):
    if not id.startswith(("sk-")):
        raise ValueError('Invalid ID format, it must start with "sk-"')
    return id

@app.get("/items/{id}")
async def read_item_detail(
    id: Annotated[str | None, AfterValidator(check_valid_id)] = None,
):
    return {"id": id}
