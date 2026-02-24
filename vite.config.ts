import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Vite's @vitejs/plugin-react injects an inline Fast Refresh preamble script in dev.
// This transform relaxes script-src in the meta CSP only during `vite serve`,
// so the production build retains the strict 'self'-only policy.
const devCspPatch = {
  name: 'dev-csp-patch',
  apply: 'serve' as const,
  transformIndexHtml: (html: string) =>
    html.replace("script-src 'self'", "script-src 'self' 'unsafe-inline'"),
};

export default defineConfig({
  plugins: [react(), devCspPatch],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:3001',
    },
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob:",
        "connect-src 'self' https://*.lambda-url.eu-central-1.on.aws ws://localhost:*",
        "worker-src blob:",
        "frame-ancestors 'none'",
      ].join('; '),
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'tanstack-vendor': ['@tanstack/react-query'],
        },
      },
    },
  },
});
