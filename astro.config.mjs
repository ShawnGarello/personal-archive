import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'astro/config';

const localPath = (path) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  root: localPath('./app/'),
  srcDir: localPath('./app/src/'),
  outDir: localPath('./dist/'),
  publicDir: localPath('./app/public/'),
  output: 'static',
  devToolbar: { enabled: false },
  vite: {
    server: {
      fs: {
        strict: true,
        allow: [localPath('./app'), localPath('./node_modules')],
        deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/private/**', '**/artifacts/**', '**/design/**'],
      },
    },
  },
});
