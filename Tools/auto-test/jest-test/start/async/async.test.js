const getData = async () => {
  return new Promise((resolve, reject) => {
    resolve(1)
  })
}

test('should async', async () => {
  const res = await getData();

  expect(res).toBe(1)
});

test('should async done', (done) => {
  getData().then(res => {
    expect(res).toBe(1)
    done()
  })
});
