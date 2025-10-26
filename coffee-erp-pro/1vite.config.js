import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  // Menghapus konfigurasi server (port/host) karena tidak relevan di Vercel
  
  // SOLUSI: Secara eksplisit mengatur 'base' ke root (/) 
  // Ini memastikan aset-aset dimuat dari jalur utama.
  base: '/', 
  
  plugins: [react()],
  resolve: {
    alias: {
      // Alias Anda
      '@': path.resolve(__dirname, '.'),
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
});
