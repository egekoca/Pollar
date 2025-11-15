import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
import path from 'path'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

/**
 * Vite plugin to inline video files as base64 data URLs
 * This ensures videos are included in single-file builds
 */
function inlineVideos(): Plugin {
  return {
    name: 'inline-videos',
    enforce: 'pre',
    transform(code, id) {
      // Transform video imports to inline data URLs
      if (id.endsWith('.mp4')) {
        try {
          let videoPath = id;
          
          // If it's a public folder reference (starts with /), resolve it
          if (id.startsWith('/')) {
            const publicPath = resolve(process.cwd(), 'public', id.substring(1));
            if (existsSync(publicPath)) {
              videoPath = publicPath;
            }
          }
          
          // Check if file exists
          if (!existsSync(videoPath)) {
            console.warn(`Video file not found: ${videoPath}`);
            return null;
          }
          
          const videoBuffer = readFileSync(videoPath);
          const base64 = videoBuffer.toString('base64');
          const dataUrl = `data:video/mp4;base64,${base64}`;
          
          // Return the data URL as a module export
          return `export default ${JSON.stringify(dataUrl)};`;
        } catch (error) {
          console.warn(`Failed to inline video ${id}:`, error);
          return null;
        }
      }
      return null;
    },
    generateBundle(options, bundle) {
      // Also handle assets that might be copied from public folder
      for (const fileName in bundle) {
        const chunk = bundle[fileName];
        
        if (chunk.type === 'asset' && fileName.endsWith('.mp4')) {
          try {
            // Try to find the video in public folder
            const publicPath = resolve(process.cwd(), 'public', fileName);
            if (existsSync(publicPath)) {
              const videoBuffer = readFileSync(publicPath);
              const base64 = videoBuffer.toString('base64');
              const dataUrl = `data:video/mp4;base64,${base64}`;
              
              // Replace the asset with inline data URL
              chunk.source = dataUrl;
            }
          } catch (error) {
            console.warn(`Failed to inline video asset ${fileName}:`, error);
          }
        }
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  // Load environment variables from .env file
  // Third parameter '' means load all env vars, not just VITE_*
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    base: './', // important for Walrus Sites - uses relative paths
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'), // alias definition
      },
    },
    plugins: [
      inlineVideos(), // Inline video files as base64 before single file plugin
      react(), 
      viteSingleFile({
        // Ensure environment variables are preserved during single file build
        removeViteModuleLoader: true,
      })
    ],
    build: {
      assetsInlineLimit: 100000000, // 100MB (inline all assets for single file)
      outDir: 'dist',
      emptyOutDir: true,
    },
    // Explicitly define environment variables to ensure they are inlined
    // This is critical for single file builds with vite-plugin-singlefile
    define: {
      // Replace import.meta.env.VITE_* with actual values at build time
      'import.meta.env.VITE_ENOKI_API_KEY': JSON.stringify(env.VITE_ENOKI_API_KEY || ''),
      'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(env.VITE_GOOGLE_CLIENT_ID || ''),
      'import.meta.env.VITE_PACKAGE_ID': JSON.stringify(env.VITE_PACKAGE_ID || ''),
      'import.meta.env.VITE_POLL_REGISTRY_ID': JSON.stringify(env.VITE_POLL_REGISTRY_ID || ''),
      // Preserve other Vite env vars
      'import.meta.env.MODE': JSON.stringify(mode),
      'import.meta.env.PROD': JSON.stringify(mode === 'production'),
      'import.meta.env.DEV': JSON.stringify(mode === 'development'),
      'import.meta.env.BASE_URL': JSON.stringify('./'),
    },
  }
})


