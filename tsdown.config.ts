import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/extension.ts'],
  format: ['cjs'],
  target: 'es2020',
  platform: 'node',
  outDir: 'dist',
  sourcemap: 'hidden',
  clean: true,
  shims: true,
  deps: {
    alwaysBundle: [
      /\@google\/genai/,
      /cheerio/,
      /fs-extra/,
      /inversify/,
      /lodash-es/,
      /openai/,
      /reflect-metadata/,
      /simple-git/,
      /tiktoken/
    ],
    neverBundle: ['vscode']
  },
  copy: ['prompt', 'node_modules/tiktoken/*.wasm'],
  outExtensions: () => ({ js: '.js', map: '.map' })
});
