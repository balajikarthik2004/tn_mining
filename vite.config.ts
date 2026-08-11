import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // maplibre-gl instantiates its tile-parsing worker via a relative
    // `new Worker(new URL(...))` call. Vite's esbuild dep pre-bundler rewrites
    // that path and breaks it (404s on maplibre-gl-worker.mjs, silently
    // failing the whole map — no tiles, no markers). Excluding it from
    // pre-bundling lets the package's own ESM build resolve the worker path
    // correctly instead.
    exclude: ['maplibre-gl'],
  },
})
