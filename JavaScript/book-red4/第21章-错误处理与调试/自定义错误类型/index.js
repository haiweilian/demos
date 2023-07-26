class CustomError extends Error {
  constrouctor(message) {
    supper(message);
    this.name = "CustomError";
    this.message = message;
  }
}

throw new CustomError("自定义错误类型");
