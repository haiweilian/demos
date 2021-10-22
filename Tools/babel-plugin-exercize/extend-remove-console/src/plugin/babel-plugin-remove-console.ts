import { declare } from '@babel/helper-plugin-utils'

const isConsole = ['log', 'info'].map(l => `console.${l}`)

export default declare((api, options = {}) => {
  api.assertVersion(7)

  return {
    visitor: {
      CallExpression(path) {
        const name = path.get('callee').toString()
        if(isConsole.includes(name)) {
          path.remove()
        }
      }
    }
  }
})
