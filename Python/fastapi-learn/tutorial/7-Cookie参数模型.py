from typing import Annotated

from fastapi import Cookie, FastAPI
from pydantic import BaseModel

app = FastAPI()


class Cookies(BaseModel):
    x_token: str
    session_id: str

#  curl -X 'GET' \
#   'http://127.0.0.1:8000/items/' \
#   -H 'accept: application/json' \
#   -H 'Cookie: x_token=abc123; session_id=789xyz'
#

# 获取Cookie数据
@app.get("/items/")
async def read_items(
    cookies: Annotated[Cookies, Cookie()]
  ):
    return cookies
