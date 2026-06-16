import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// IMPORTANT: the site is served from a custom domain (https://jackthestag.co.uk/)
// at the root, so `base` must be '/'. If you ever revert to the GitHub Pages
// repo subpath (https://<user>.github.io/Jack-Stag-Website/) the production base
// must match that subpath exactly, otherwise asset URLs 404 and the deploy is a
// blank page. Test the built output, not just `npm run dev`.
export default defineConfig(() => ({
  base: '/',
  plugins: [react()],
  // Honour the PORT env var when one is provided (e.g. the Claude preview
  // harness assigns a free port this way). Vite otherwise ignores PORT and
  // picks its own port, which leaves the preview proxy pointing at nothing.
  // strictPort so we bind exactly the assigned port rather than drifting.
  server: process.env.PORT
    ? { port: Number(process.env.PORT), strictPort: true }
    : undefined,
}));
