const mockCallback = jest.fn(x => 42 + x);

[1, 2].forEach(mockCallback);

describe('mock', () => {
  test('should mock', () => {
    // 此 mock 函数被调用了两次
    expect(mockCallback.mock.calls.length).toBe(2)

    // 第一次调用函数时的第一个参数是 1
    expect(mockCallback.mock.calls[0][0]).toBe(1)

    // 第二次调用函数时的第一个参数是 2
    expect(mockCallback.mock.calls[1][0]).toBe(2)
  });
})
