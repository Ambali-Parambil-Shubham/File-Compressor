import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],

  // ─── Dev Server ──────────────────────────────────────────────────────────────
  server: {
    open: true,
    hmr: { overlay: false },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
    watch: {
      ignored: ['**/dist/**', '**/*.class', '**/node_modules/**'],
    },
  },

  // ─── Production Build ─────────────────────────────────────────────────────────
  build: {
    // Split CSS per-chunk for better caching
    cssCodeSplit: true,

    // Raise limit to suppress false-positive warnings on intentional large chunks
    chunkSizeWarningLimit: 800,

    rollupOptions: {
      output: {
        // ── Fine-grained manual chunk splitting ──────────────────────────────
        manualChunks(id) {
          // React core (smallest, most-cached chunk)
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/')
          ) {
            return 'vendor-react';
          }

          // Supabase — isolated so it doesn't bust other caches on app changes
          if (id.includes('node_modules/@supabase/')) {
            return 'vendor-supabase';
          }

          // pdf-lib — large but rarely updated
          if (id.includes('node_modules/pdf-lib') || id.includes('node_modules/@pdf-lib')) {
            return 'vendor-pdflib';
          }

          // JSZip — medium-sized, rarely updated
          if (id.includes('node_modules/jszip')) {
            return 'vendor-jszip';
          }
        },

        // Stable filenames improve long-term cache hit rates
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
})
