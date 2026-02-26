import { defineConfig } from 'astro/config';
import { remarkSvgBlock } from './src/plugins/remark-svg-block.mjs';

export default defineConfig({
  site: 'https://www.akshaybajpai.com',
  output: 'static',
  markdown: {
    remarkPlugins: [remarkSvgBlock],
  },
  build: {
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
  vite: {
    build: {
      cssCodeSplit: true,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/three')) return 'three';
            if (id.includes('NeuralScene')) return 'neural';
          },
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
      },
      chunkSizeWarningLimit: 350,
    },
  },
});
