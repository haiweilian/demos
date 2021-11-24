test('should array', () => {
  const arr = [1, 2, 'hello', 'word', { one: 1}]
  const set = new Set(arr)

  expect(arr).toContain(1)
  expect(set).toContain('hello')
  expect(arr).toContainEqual({one: 1})
});
