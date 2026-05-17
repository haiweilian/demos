from fastapi import FastAPI
from pydantic import BaseModel
from typing import Any

app = FastAPI()


class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    tax: float | None = None
    tags: list[str] = []


# -> Item 必须严格匹配 Item 模型的字段
@app.post("/items/")
async def create_item(item: Item) -> Item:
    return item


@app.get("/items/")
async def read_items() -> list[Item]:
    return [
        Item(name="Portal Gun", price=42.0),
        Item(name="Plumbus", price=32.0),
    ]


# -> response_model 返回的数据与声明的类型不完全一致。
@app.post("/items2/", response_model=Item)
async def create_item2(item: Item) -> Any:
    return item


@app.get("/items2/", response_model=list[Item])
async def read_items2() -> Any:
    return [
        {"name": "Portal Gun", "price": 42.0},
        {"name": "Plumbus", "price": 32.0},
    ]
