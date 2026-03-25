import {defineConfig} from 'vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {oxygen} from '@shopify/mini-oxygen/vite';
import {reactRouter} from '@react-router/dev/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import {sanity} from 'hydrogen-sanity/vite';
export default defineConfig({
  plugins: [hydrogen(), oxygen(), sanity(), reactRouter(), tsconfigPaths()],
  build: {
    // Allow a strict Content-Security-Policy
    // without inlining assets as base64:
    assetsInlineLimit: 0,
  },
  ssr: {
    optimizeDeps: {
      /**
       * Include dependencies here if they throw CJS<>ESM errors.
       * For example, for the following error:
       *
       * > ReferenceError: module is not defined
       * >   at /Users/.../node_modules/example-dep/index.js:1:1
       *
       * Include 'example-dep' in the array below.
       * @see https://vitejs.dev/config/dep-optimization-options
       */
      include: ['set-cookie-parser', 'cookie', 'react-router'],
    },
  },
  server: {
    allowedHosts: [
      '.tryhydrogen.dev',
      'watercolors-by-kathy-greve.myshopify.com',
      'd8e5-2600-4040-5411-fb00-2078-edc7-d091-959c.ngrok-free.app',
    ],
  },
});
