// @ts-check
import { defineConfig } from 'astro/config';

// Static site → works on Vercel and GitHub Pages.
// For GitHub Pages project sites, set base to '/restream-bingo/' (repo name).
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site: process.env.SITE_URL || 'https://example.com',
  base,
  output: 'static',
  trailingSlash: 'ignore',
});
