test('should string', () => {
  const string = 'hello word!'
  expect(string).toMatch('hello')
  expect(string).toMatch('word')
  expect(string).not.toMatch('haha')
});
