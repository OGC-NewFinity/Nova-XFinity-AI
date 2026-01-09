import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/', // ✅ Ensure base path is root
      publicDir: path.resolve(__dirname, 'frontend/public'), // ✅ Configure public directory
      server: {
        port: 3000,
        host: '0.0.0.0',
        strictPort: false, // Allow fallback to next available port
        cors: {
          origin: [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:10000',
            'http://127.0.0.1:3000',
            'https://ogcnewfinity.com',
          ],
          credentials: true
        },
        // Proxy configuration for API requests during development
        proxy: {
          '/api': {
            target: env.VITE_API_URL || 'http://localhost:3001',
            changeOrigin: true,
            secure: false, // Allow self-signed certificates in dev
            rewrite: (path) => path, // Keep /api prefix
            configure: (proxy, options) => {
              proxy.on('proxyReq', (proxyReq, req, res) => {
                // Forward origin header
                if (req.headers.origin) {
                  proxyReq.setHeader('Origin', req.headers.origin);
                }
                // Forward credentials
                proxyReq.setHeader('Cookie', req.headers.cookie || '');
              });
              
              proxy.on('error', (err, req, res) => {
                console.error('Proxy error:', err);
              });
            }
          },
          '/plugin': {
            target: 'http://localhost:10000',
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/plugin/, ''),
          }
        }
      },
      plugins: [
        react({
          include: "**/*.{jsx,js}", // Process both .js and .jsx files
        })
      ],
      define: {
        // SECURITY: API keys should NEVER be exposed to frontend
        // All AI provider API calls must go through backend APIs
        // Removed: process.env.API_KEY and process.env.GEMINI_API_KEY
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, 'frontend/src'),
        },
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
      }
    };
});
