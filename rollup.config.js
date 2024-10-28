import path from 'path';
import fs from 'fs';

import { marked } from 'marked';

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
                { src: 'src/lang/*.json', dest: 'build/' },
                { src: 'src/assets/**/*', dest: 'build/' },
            ],
            flatten: false,
        }),

        // Custom markdown parser
        markdownParser({
            targets: [
                { src: 'src/release-notes.md', dest: 'build/' },
            ],
        }),
    ],
};

/* --- Custom Plugins --- */

function markdownParser(config) {
    return {
        name: 'markdown-parser',
        buildEnd() {
            // Read all markdown files from the config targets
            const markdownFiles = config.targets
                .filter((target) => target.src.endsWith('.md'))
                .filter((target) => fs.existsSync(target.src))
                .map((target) => {
                    return fs.readFileSync(target.src, 'utf8');
                });

            // Parse the markdown files
            const parsedMarkdown = markdownFiles.map((file) => {
                return marked(file);
            });

            // Write the parsed markdown to the output directory
            parsedMarkdown.forEach((markdown, index) => {
                // Get source path (except the top most directory)
                const srcPath = path.dirname(config.targets[index].src).split(path.sep).slice(1).join(path.sep);

                // Get file name without extension from the source path
                const fileName = path.basename(config.targets[index].src, path.extname(config.targets[index].src));

                // Construct the destination path
                const dest = path.join(srcPath, config.targets[index].dest, `${fileName}.html`);
                const destDir = path.join(srcPath, config.targets[index].dest);
                if(!fs.existsSync(destDir)){
                    fs.mkdirSync(destDir);
                }

                // Write the parsed markdown to the destination path
                fs.writeFileSync(dest, `<div>${markdown}</div>`);
            });
        } 
    }
}