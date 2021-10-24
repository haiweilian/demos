export default function (options) {
  console.log(options)
  var virtualFileId = '@my-virtual-file'
  return {
    name: 'my-virtual-file',
    resolveId(id) {
      if(id === virtualFileId) {
        return virtualFileId
      }
    },
    load(id) {
      if(id === virtualFileId) {
        return `export const msg = "from virtual file"`
      }
    }
  }
}
