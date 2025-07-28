import vue from 'rollup-plugin-vue';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import image from '@rollup/plugin-image';
import codeSweeper from '@fe-fast/code-sweeper/rollup';

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'esm',
  },
  plugins: [
    vue({
      isProduction: true,
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('my-')
        }
      }
    }),
    postcss(),
    resolve({ browser: true }),
    commonjs({ include: /node_modules/ }),
    image(),
    codeSweeper(),
  ],
};