import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Custom plugin to inline critical CSS directly into HTML <head>
// Completely eliminates render-blocking stylesheet requests (170ms latency savings)
function inlineCssPlugin(): Plugin {
  return {
    name: 'inline-css-plugin',
    apply: 'build',
    enforce: 'post',
    transformIndexHtml(html, { bundle }) {
      if (!bundle) return html;
      let css = '';
      for (const [fileName, file] of Object.entries(bundle)) {
        if (fileName.endsWith('.css') && file.type === 'asset') {
          css += file.source.toString();
          delete bundle[fileName];
        }
      }
      if (css) {
        // Remove stylesheet link tags and inject inline style
        const cleanedHtml = html.replace(/<link[^>]+rel=["']stylesheet["'][^>]*>\s*/gi, '');
        return cleanedHtml.replace('</head>', `<style>${css}</style></head>`);
      }
      return html;
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), inlineCssPlugin()],
  build: {
    target: 'es2020',
    cssCodeSplit: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/scheduler')
          ) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 5173,
    host: true,
  },
})
