// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  // Canonical production origin. Override per-environment with the SITE_URL env var.
  // Used by Astro.site, canonical URLs, sitemaps and the RSS feed.
  site: process.env.SITE_URL || 'https://thelumentech.com',
  output: 'server',
  server: {
    host: true,
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [react()],

  adapter: vercel(),
});