import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// IMPORTANT: the production `base` must exactly match the GitHub Pages repo
// subpath (https://<user>.github.io/Jack-Stag-Website/). A mismatch produces a
// blank deploy because asset URLs 404. Test the built output, not just
// `npm run dev`. The dev server serves from root ('/') so local tooling and
// preview proxies work without the subpath.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Jack-Stag-Website/' : '/',
  plugins: [react()],
}));
