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
  // Honour the PORT env var when one is provided (e.g. the Claude preview
  // harness assigns a free port this way). Vite otherwise ignores PORT and
  // picks its own port, which leaves the preview proxy pointing at nothing.
  // strictPort so we bind exactly the assigned port rather than drifting.
  server: process.env.PORT
    ? { port: Number(process.env.PORT), strictPort: true }
    : undefined,
}));
