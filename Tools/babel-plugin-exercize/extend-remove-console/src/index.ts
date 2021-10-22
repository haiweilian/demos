import { transformFileSync } from '@babel/core'
import path from 'path'
import BabelPluginRemoveConsole from './plugin/babel-plugin-remove-console'

const { code } = transformFileSync(path.join(__dirname, 'file-test.tsx'), {
  plugins: [BabelPluginRemoveConsole],
  presets: ['typescript']
})

console.log(code);
