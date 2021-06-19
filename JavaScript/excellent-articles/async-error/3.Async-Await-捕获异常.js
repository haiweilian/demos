function fetch() {
  return new Promise((resolve, reject) => {
    reject("error");
  });
}

async function main () {
  try {
    await fetch()
    console.log('不会执行')
  } catch (error) {
    console.log('..........', error)
  }
}

main()
