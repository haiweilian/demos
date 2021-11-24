test('should null', () => {
  const n = null;
  // expect . toBeXXX 对应的类型
  expect(n).toBeNull()
  expect(n).toBeFalsy()
  // expect(n).toBeUndefined()
  expect(n).not.toBeUndefined()
  expect(n).not.toBeTruthy()
});
