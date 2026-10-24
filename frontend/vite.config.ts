import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/static/', // Les assets seront servis par Django sous /static/
  build: {
    outDir: path.resolve(__dirname, '../backend/staticfiles'),
    emptyOutDir: true,
  },
});