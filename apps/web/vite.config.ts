import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const rootDir = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@ve/editor-schema': path.join(rootDir, 'packages/editor-schema/src'),
      '@ve/editor-core': path.join(rootDir, 'packages/editor-core/src'),
      '@ve/editor-ui': path.join(rootDir, 'packages/editor-ui/src'),
      '@ve/editor-embed': path.join(rootDir, 'packages/editor-embed/src'),
    },
  },
  server: {
    port: 5177,
    fs: {
      allow: [rootDir],
    },
  },
});
