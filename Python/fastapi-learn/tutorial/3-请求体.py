from fastapi import FastAPI
from pydantic import BaseModel

# 请求体, 使用 pydantic 模型验证，继承 BaseModel
class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    tax: float | None = None

app = FastAPI()

@app.post("/items/")
async def create_item(item: Item):
    # 转换为字典，也就是对象
    item_dict = item.model_dump()
    print(f'xxxxxx: {item} {item_dict}')
    return item
