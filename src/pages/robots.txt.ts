import type { APIRoute } from 'astro';
import { isProductionMode } from '../data/business';

// Only a production build with a real domain is crawlable; dev and review builds block everything.
export const GET: APIRoute = ({ site }) =>
  new Response(
    isProductionMode && site
      ? `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap-index.xml', site).href}\n`
      : 'User-agent: *\nDisallow: /\n',
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
  );
