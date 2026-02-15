import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:4321',
  adapter: node({ mode: 'standalone' }),
  integrations: [tailwind()],
});
