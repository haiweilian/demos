const fileRegex = /\.(test)$/

export default function () {
  return {
    name: 'my-transform-file',
    transform(code, id) {
      // code 源码
      // id 文件后缀
      if(fileRegex.test(id)) {
        // console.log(code,id)
        // 返回新的代码
        return {
          code: `export const transform = "hello from transform file"`,
          map: null // provide source map if available
        }
      }
    }
  }
}
