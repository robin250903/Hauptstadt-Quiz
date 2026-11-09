import { defineConfig } from 'vite';

// Relative Pfade, damit die App auch in einem Unterordner (z. B. GitHub Pages) läuft
export default defineConfig({
  base: './',
  build: { target: 'es2020' },
});
