import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vitejs.dev/config
export default defineConfig({
  plugins: [tailwindcss()],
  publicDir: path.resolve(__dirname, 'assets'),
  base: './',
});
