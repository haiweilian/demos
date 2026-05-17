from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

# 参数会根据类型自动校验，比如 int 会校验是否为数字，并且会转换为 int 类型
@app.get("/items/{item_id}")
async def read_item(item_id: int):
    return {"item_id": item_id}

# 路径参数从路径中获取参数
@app.get("/files/{file_path:path}")
async def read_file(file_path: str):
    return {"file_path": file_path}
