import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import pkg from './package.json'

const name = 'Lib'

export default [
  {
    input: 'src/main.js',
    output: {
      name: name,
      file: pkg.main,
      format: 'umd',
    },
    plugins: [resolve(), commonjs(), babel({ babelHelpers: 'bundled' })],
  },
  {
    input: 'src/main.js',
    output: {
      name: name,
      file: pkg.module,
      format: 'esm',
    },
  },
]
