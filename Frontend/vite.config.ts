import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Ensure assets from public are copied
    copyPublicDir: true,
    assetsDir: 'assets', // This is the default, but good to be explicit
  },
  // Ensure base path is correct for deployment, especially if not at root
  base: '/',
  // Explicitly set server configuration
  server: {
    port: 5173,
    strictPort: true, // Fail if port 5173 is not available
    host: true, // Listen on all addresses
  },
});
