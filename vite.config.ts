import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // ensures relative paths for assets so static hosting works seamlessly
  build: {
    assetsInlineLimit: 0, // don't inline assets, let them be distinct files for clarity
    target: 'esnext'
  },
  server: {
    port: 5173,
    host: true
  }
});
