const sum = require('./sum')

// test
test('should adds 1 + 2 to equal 3', () => {
  // expect 匹配器
  expect(sum(1, 2)).toBe(3)
});
