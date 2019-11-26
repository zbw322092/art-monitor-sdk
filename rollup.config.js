import typescript from 'rollup-plugin-typescript';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';

export default [
  {
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
      postcss()
      // terser({
      //   compress: true,
      //   mangle: {
      //     toplevel: true,
      //   }
      // })
    ]
  },
  {
    input: './src/replay/replay.ts',
    output: {
      format: 'iife',
      name: 'Replay',
      dir: './dist',
      file: 'art.monitor.replay.js'
    },
    plugins: [
      typescript(),
      babel({
        include: ['src/**/*'],
        exclude: 'node_modules/**'
      }),
      postcss()
      // terser({
      //   compress: true,
      //   mangle: {
      //     toplevel: true,
      //   }
      // })
    ]
  }
]