import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// IMPORTANT: `base` must exactly match the GitHub Pages repo subpath
// (https://<user>.github.io/Jack-Stag-Website/). A mismatch produces a blank
// deploy because asset URLs 404. Test the built output, not just `npm run dev`.
export default defineConfig({
  base: '/Jack-Stag-Website/',
  plugins: [react()],
});
