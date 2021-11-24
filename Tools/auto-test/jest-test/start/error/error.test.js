function isNumber() {
  throw new Error('is not a number')
}

test('should error', () => {
  expect(isNumber).toThrowError('is not a number')
});
