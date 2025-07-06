import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts', 'src/constants/index.ts', 'src/types/index.ts'],
    outDir: 'dist',
    target: 'node23',
    splitting: false,
    sourcemap: true,
    clean: true,
    format: ['esm'],
    dts: true,
});
