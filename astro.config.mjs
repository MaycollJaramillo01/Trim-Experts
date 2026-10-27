// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

// Modes: `astro dev` (development), `astro build` (production), `astro build --mode review`.
const argv = process.argv;
const mode = argv.includes('--mode')
  ? argv[argv.indexOf('--mode') + 1]
  : argv.includes('dev') ? 'development' : 'production';
const { SITE_URL } = loadEnv(mode, process.cwd(), '');
const isProductionBuild = argv.includes('build') && mode === 'production';

// Canonicals, sitemap and JSON-LD need the real domain. Never fall back to a placeholder.
if (isProductionBuild && !SITE_URL) {
  throw new Error(
    'SITE_URL is required for production builds. Set it in .env (see .env.example) or run `npm run build:review` for a non-indexable review build.'
  );
}

export default defineConfig({
  site: SITE_URL ? new URL(SITE_URL).origin : undefined,
  trailingSlash: 'always',
  integrations: isProductionBuild ? [sitemap()] : [],
});
