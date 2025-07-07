import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/**/*.ts', '!src/**/__tests__/**'],
    outDir: 'dist',
    target: 'node23',
    format: ['cjs'],
    splitting: false,
    sourcemap: true,
    clean: true, // clean dist before build
    dts: false,
});
