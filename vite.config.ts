
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {
      GEMINI_API_KEY: JSON.stringify(process.env.GEMINI_API_KEY)
    }
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'leaflet', 'react-leaflet', 'lucide-react'],
          genai: ['@google/genai']
        }
      }
    }
  }
});
