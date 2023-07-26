// let sku = [
//   {
//     name: "大小",
//     value: [
//       { name: "大", id: "100" },
//       { name: "小", id: "200" },
//     ],
//   },
// ]
function renderData(data) {
  data.forEach((item) => {
    console.log(item.name, item.value)
  })
}

let sku = [
  { id: "100", name: "大小", value: "大" },
  { id: "100", name: "大小", value: "小" },
]
function arrayAdapter(data) {
  let maps = {}

  data.forEach((item) => {
    if (maps[item.name] === void 0) {
      maps[item.name] = []
    }
    maps[item.name].push(item)
  })

  return Object.entries(maps).map(([name, value]) => {
    return {
      name,
      value,
    }
  })
}

renderData(arrayAdapter(sku))
