// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';
import commonjs from '@rollup/plugin-commonjs';
import scss from 'rollup-plugin-scss';

export default {
    input: './src/index.ts',
    output: {
        dir: 'build',
        format: 'es',

        // Removes the hash from the asset filename
        assetFileNames: '[name][extname]',
    },
    plugins: [
        // CSS
        scss(),

        // Typescript
        nodeResolve({ preferBuiltins: true }),
        typescript(),
        commonjs(),

        // Copy system.json & templates
        copy({
            targets: [
                { src: 'src/system.json', dest: 'build' },
                { src: 'src/templates/**/*.hbs', dest: 'build/' },
                { src: 'src/lang/*.json', dest: 'build/' }
            ],
            flatten: false
        }),
    ],
};
