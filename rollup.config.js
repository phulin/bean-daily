import babel from '@rollup/plugin-babel';
import typescript from '@rollup/plugin-typescript';

const config = {
  input: 'src/hobodiet.ts',
  output: {
    dir: 'build',
    format: 'esm',
  },
  plugins: [
    babel({
      babelHelpers: 'bundled',
      extensions: ['.js', '.ts'],
    }),
    typescript(),
  ],
};

export default config;