// @ts-check
import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import { loadEnv } from 'vite';

// Modes: `astro dev` (development), `astro build` (production), `--mode staging`, `--mode review`.
const argv = process.argv;
const mode = argv.includes('--mode')
  ? argv[argv.indexOf('--mode') + 1]
  : argv.includes('dev') ? 'development' : 'production';
const { SITE_URL } = loadEnv(mode, process.cwd(), '');
const isProductionBuild = argv.includes('build') && mode === 'production';

// Canonicals, sitemap and JSON-LD need the real domain. Never fall back to a placeholder.
if (isProductionBuild && !SITE_URL) {
  throw new Error(
    'SITE_URL is required for production builds. Set it in .env (see .env.example) or run `npm run build:staging` for a non-indexable build.'
  );
}

const secret = (optional = true) => envField.string({ context: 'server', access: 'secret', optional });

export default defineConfig({
  site: SITE_URL ? new URL(SITE_URL).origin : undefined,
  trailingSlash: 'always',
  // Pages stay static; only /api/estimate runs on demand (Vercel Function).
  adapter: vercel(),
  integrations: isProductionBuild ? [sitemap()] : [],
  env: {
    schema: {
      SMTP_HOST: secret(),
      SMTP_PORT: envField.number({ context: 'server', access: 'secret', default: 587 }),
      SMTP_USER: secret(),
      SMTP_PASSWORD: secret(),
      CONTACT_TO: secret(),
      CONTACT_CC: secret(),
    },
  },
});
