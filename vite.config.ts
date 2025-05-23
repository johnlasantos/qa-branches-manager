
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { splitVendorChunkPlugin } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: './',
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy API requests to backend during development
      // The proxy will only be used if apiBaseUrl is not set in config.json
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    // Output to dist/manager for unified build
    outDir: 'dist/manager',
    emptyOutDir: true,
    // Enable source map for development only
    sourcemap: mode === 'development',
    // Optimize chunks for better browser caching
    rollupOptions: {
      output: {
        // Use function form of manualChunks for compatibility with splitVendorChunk
        manualChunks(id) {
          // Bundle React and ALL its dependencies together to prevent runtime errors
          if (id.includes('node_modules')) {
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('scheduler') ||
              id.includes('prop-types') ||
              id.includes('use-sync-external-store') ||
              id.includes('jsx-runtime') ||
              id.includes('jsx-dev-runtime')
            ) {
              return 'react-vendor';
            }
            
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            
            if (id.includes('@tanstack/react-query')) {
              return 'tanstack-vendor';
            }
            
            // All other node_modules go into the default vendor chunk
            return 'vendor';
          }
        }
      },
    },
    // Minify output for production
    minify: mode !== 'development',
    // Set chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  plugins: [
    react({
      // Use SWC's built-in minification in development
      plugins: mode === 'development' ? [] : undefined,
    }),
    // Automatically split vendor chunks
    splitVendorChunkPlugin(),
    // Bundle analyzer in analyze mode only
    mode === 'analyze' && visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Optimize deps prefetching - ensure all React packages are included together
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      '@tanstack/react-query',
      'scheduler',
      'prop-types'
    ],
  },
}));
