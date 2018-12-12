import typescript from 'rollup-plugin-typescript';
import babel from 'rollup-plugin-babel';
import { uglify } from "rollup-plugin-uglify";

export default {
  input: './src/index.ts',
  output: {
    format: 'iife',
    dir: './dist',
    file: 'art.monitor.sdk.min.js'
  },
  plugins: [
    typescript(),
    babel({
      exclude: 'node_modules/**'
    }),
    uglify({
      sourcemap: false,
      compress: {
        warnings: true,
        dead_code: true,
        drop_debugger: true,
        drop_console: true
      }
    })
  ]
}