import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Relative Pfade, damit die App auch in einem Unterordner (z. B. GitHub Pages) läuft.
// Zwei Apps: das Hauptstadt-Quiz (index.html) und der Geo-Trainer (geo/index.html).
export default defineConfig({
  base: './',
  build: {
    target: 'es2020',
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        geo: resolve(import.meta.dirname, 'geo/index.html'),
      },
    },
  },
});
