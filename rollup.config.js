import typescript from 'rollup-plugin-typescript';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';

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
      include: ['src/**/*'],
      exclude: 'node_modules/**'
    }),
    // terser({
    //   compress: true,
    //   mangle: {
    //     toplevel: true,
    //   }
    // })
  ]
}