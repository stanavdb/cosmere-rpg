// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: [
            'build/',
            'scripts/',
            'src/declarations/',
            'eslint.config.mjs',
            'rollup.config.js',
            'commitlint.config.js',
            'lint-staged-config.mjs',
            'scripts/',
        ],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    {
        rules: {
            '@typescript-eslint/no-namespace': 'off',
            '@typescript-eslint/no-base-to-string': 'off'
        },
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
                allowDefaultProject: ['*.js'],
            },
        },
    },
);
