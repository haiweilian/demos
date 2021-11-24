test('should number', () => {
  const value = 2 + 2
  // toBe-比较符-Than-相等
  expect(value).toBe(4)
  expect(value).toEqual(4)
  // 大于目标值
  expect(value).toBeGreaterThan(3)
  // 大于等于目标值
  expect(value).toBeGreaterThanOrEqual(4)
  // 小于目标值
  expect(value).toBeLessThan(5)
  // 小于等于目标值
  expect(value).toBeLessThanOrEqual(4)
});

test('should float number', () => {
  const value = 0.1 + 0.2
  // 比较浮点数
  expect(value).toBeCloseTo(0.3)
});
