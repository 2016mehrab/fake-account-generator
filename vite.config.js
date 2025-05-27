import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        inbox: resolve(__dirname, 'inbox.js'),
        email: resolve(__dirname, 'email.js'),
        render: resolve(__dirname, 'render.js'),
        app: resolve(__dirname, 'app.js'),
        consts: resolve(__dirname, 'consts.js'),
        utils: resolve(__dirname, 'utils.js'),
        fakeDataGenerator: resolve(__dirname, 'fakeDataGenerator.js')
      },
      output: {
        entryFileNames: '[name].js'
      }
    }
  }
});
