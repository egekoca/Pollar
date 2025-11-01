import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
import path from 'path'

export default defineConfig(
{
  base: './', // important
  resolve: 
  {
    alias: {
      '@': path.resolve(__dirname, './src'), // alias definition
    },
  },
  plugins: [react(), viteSingleFile()],
  build: {
    assetsInlineLimit: 100000000, // 100MB (inline all assets)
  },
})


