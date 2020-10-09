import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import { uglify } from "rollup-plugin-uglify"
import pkg from './package.json'

const name = pkg.name

export default [
  {
    input: 'src/main.js',
    output: {
      name: pkg.space,
      file: `dist/${name}.js`,
      format: 'umd',
    },
    plugins: [resolve(), commonjs(), babel({ babelHelpers: 'bundled' })],
  },
  {
    input: 'src/main.js',
    output: {
      name: pkg.space,
      file: `dist/${name}.min.js`,
      format: 'umd',
    },
    plugins: [resolve(), commonjs(), babel({ babelHelpers: 'bundled' }), uglify()],
  },
  {
    input: 'src/main.js',
    output: {
      name: pkg.space,
      file: `dist/${name}.esm.js`,
      format: 'esm',
    },
    plugins: [resolve(), commonjs()],
  },
]
