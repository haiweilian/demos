from typing import Annotated

from fastapi import FastAPI, Path

app = FastAPI()


# Annotated 是一个类型注解，用于在类型上添加元数据
# Path 是一个路径参数的装饰器，用于指定路径参数的元数据，比如最大长度
@app.get("/items/{q}")
async def read_items(
    q: Annotated[
        str,
        Path(
            min_length=3,
            max_length=50,
            title="Query string",
            description="Query string",
            # 等等参数
        ),
    ],
):
    results = {"items": [{"item_id": "Foo"}, {"item_id": "Bar"}]}
    if q:
        results.update({"q": q})
    return results
