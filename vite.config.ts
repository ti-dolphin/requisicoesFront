import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build : {
    minify: false,
    
  },
  esbuild : {
    keepNames : true,
    minifyIdentifiers: false,
    minify: undefined,
  }
})
