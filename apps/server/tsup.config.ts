import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    outDir: 'dist',
    target: 'node23',
    format: ['esm'],
    splitting: false,
    sourcemap: true,
    clean: true, // clean dist before build
    dts: false,
});
