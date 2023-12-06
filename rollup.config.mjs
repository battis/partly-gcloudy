import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import pkg from './package.json' assert { type: 'json' };
import { dts } from 'rollup-plugin-dts';

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.mjs',
      format: 'esm'
    },
    external: Object.keys(pkg.dependencies),
    plugins: [
      commonjs(),
      nodeResolve(),
      typescript({ tsconfig: 'tsconfig.esm.json' })
    ]
  },
  {
    input: './tmp/types/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()]
  }
];
