import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/cli.ts'],
  format: ['cjs', 'esm'],
  platform: 'neutral',
  dts: true,
  clean: true,
  splitting: true,
  minify: true,
});
