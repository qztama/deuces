import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts', 'src/utils/index.ts', 'src/constants.ts', 'src/types/index.ts'],
    outDir: 'dist',
    target: 'node23',
    splitting: false,
    sourcemap: true,
    clean: true,
    format: ['esm', 'cjs'],
    dts: true,
    tsconfig: './tsconfig.json',
    esbuildOptions(options) {
        options.platform = 'node';
    },
});
