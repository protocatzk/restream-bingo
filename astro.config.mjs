// @ts-check
import { defineConfig } from 'astro/config';

/**
 * Static site for Vercel (BASE_PATH=/) and GitHub Pages (BASE_PATH=/repo-name/).
 * Set via env in CI; defaults work for local dev and Vercel.
 */
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site: process.env.SITE_URL || 'https://example.com',
  base,
  output: 'static',
  trailingSlash: 'ignore',
});
