// Post-build checks for a PRODUCTION build (`npm run build` with SITE_URL set), then writes docs/page-matrix.md.
// Usage: node scripts/verify.mjs   (Node >= 22.18 runs the imported .ts files directly)
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { validateLead } from '../src/lib/lead.ts';
import { services } from '../src/data/services.ts';

// ---- 1. Form validation contract ----
const ok = { name: 'Ana Ruiz', email: 'ana@example.com', phone: '', service: 'Custom Closets', location: 'Park Slope', message: 'Walk-in closet, about 6 by 8 feet, need shelving.' };
assert.deepEqual(validateLead(ok), {});
assert.deepEqual(validateLead({ ...ok, phone: '(347) 632-6556' }), {});
assert.ok(validateLead({ ...ok, email: 'ana@' }).email);
assert.ok(validateLead({ ...ok, phone: '123' }).phone);
assert.ok(validateLead({ ...ok, phone: 'call me' }).phone);
assert.ok(validateLead({ ...ok, service: '' }).service);
assert.ok(validateLead({ ...ok, message: 'too short' }).message);
assert.ok(validateLead({ ...ok, message: 'x'.repeat(3001) }).message);
assert.ok(validateLead({ ...ok, name: ' ' }).name);
console.log('lead validation: ok');

// ---- 2. Built site ----
// With the Vercel adapter, static pages land in dist/client/.
const dist = new URL('../dist/client/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
assert.ok(existsSync(dist), 'dist/client/ not found: run `npm run build` first');
const files = readdirSync(dist, { recursive: true }).map(String).filter((f) => f.endsWith('.html'));
const route = (f) => '/' + f.split(sep).join('/').replace(/index\.html$/, '').replace(/\.html$/, '/');
const attr = (html, re) => (html.match(re) || [])[1];
const problems = [];
const pages = [];

const robots = readFileSync(join(dist, 'robots.txt'), 'utf8');
const site = attr(robots, /Sitemap: (https?:\/\/[^/\s]+)/);
assert.ok(site, 'robots.txt has no Sitemap line: this is not a production build with SITE_URL');

const exists = (p) => {
  const clean = decodeURIComponent(p.split(/[?#]/)[0]);
  const full = join(dist, clean);
  return existsSync(full) && (clean.endsWith('/') ? existsSync(join(full, 'index.html')) : true);
};

for (const f of files) {
  const html = readFileSync(join(dist, f), 'utf8');
  const r = route(f);
  const is404 = r === '/404/';
  const p = {
    route: is404 ? '/404' : r,
    title: attr(html, /<title>([^<]*)<\/title>/),
    description: attr(html, /<meta name="description" content="([^"]*)"/),
    canonical: attr(html, /<link rel="canonical" href="([^"]*)"/),
    noindex: /<meta name="robots" content="noindex/.test(html),
    h1: [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => m[1].replace(/<[^>]+>/g, '').trim()),
    links: [...new Set([...html.matchAll(/<a [^>]*href="(\/[^"#]*)[^"]*"/g)].map((m) => m[1]))].sort(),
    // Contextual links only (inside <main>, excluding image files) for the matrix.
    mainLinks: [...new Set([...(attr(html, /<main[^>]*>([\s\S]*)<\/main>/) || '').matchAll(/<a [^>]*href="(\/[^"#]*)[^"]*"/g)].map((m) => m[1]))]
      .filter((l) => !l.startsWith('/_astro/') && l !== r)
      .sort(),
    assets: [...html.matchAll(/(?:src|srcset)="([^"]+)"/g)].flatMap((m) => m[1].split(',').map((s) => s.trim().split(' ')[0])).filter((u) => u.startsWith('/')),
  };
  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  const err = (m) => problems.push(`${p.route}: ${m}`);
  if (!p.title) err('missing <title>');
  if (!p.description) err('missing meta description');
  if (p.h1.length !== 1) err(`expected 1 <h1>, found ${p.h1.length}`);
  if (!is404) {
    if (p.canonical !== site + r) err(`canonical ${p.canonical} != ${site + r}`);
    if (p.noindex) err('indexable page has noindex');
    if (ld.length !== 1) err('expected one JSON-LD block');
    for (const m of ld) {
      const types = JSON.parse(m[1])['@graph'].map((n) => n['@type']);
      p.schema = types.join(', ');
      if (!types.includes('HomeAndConstructionBusiness')) err('JSON-LD without business node');
      if (/"(address|geo|aggregateRating|review|priceRange)"/.test(m[1])) err('JSON-LD contains unverified property');
    }
  } else if (!p.noindex) err('404 must be noindex');
  for (const l of p.links) if (!exists(l)) err(`broken internal link ${l}`);
  for (const a of p.assets) if (!exists(a)) err(`missing asset ${a}`);
  if (/\+58|tel:\+58/.test(html)) err('intermediary phone number found');
  if (/free estimate/i.test(html)) err('"free estimate" wording found');
  pages.push(p);
}

const drafts = services.filter((s) => s.status !== 'published').map((s) => `/services/${s.slug}/`);
for (const d of drafts) {
  if (pages.some((p) => p.route === d)) problems.push(`draft page built: ${d}`);
  if (pages.some((p) => p.links.includes(d))) problems.push(`draft page linked: ${d}`);
}
for (const key of ['title', 'description']) {
  const seen = new Map();
  for (const p of pages) if (seen.has(p[key])) problems.push(`duplicate ${key} on ${p.route} and ${seen.get(p[key])}`); else seen.set(p[key], p.route);
}

const sitemap = readdirSync(dist).filter((f) => /^sitemap-\d+\.xml$/.test(f)).map((f) => readFileSync(join(dist, f), 'utf8')).join('');
const inSitemap = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(site, '')).sort();
const indexable = pages.filter((p) => p.route !== '/404').map((p) => p.route).sort();
assert.deepEqual(inSitemap, indexable, 'sitemap must list exactly the indexable pages');

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`site audit: ${pages.length} pages ok, sitemap ${inSitemap.length} URLs, drafts excluded: ${drafts.length}`);

// ---- 3. Page matrix ----
const intents = {
  '/': 'Navegacional/local: "Trim Experts", "door installation / closets / decks Brooklyn" genéricos.',
  '/about/': 'Navegacional: quién es Trim Experts, datos de contacto verificables.',
  '/services/': 'Comercial: comparar servicios disponibles en Brooklyn.',
  '/projects/': 'Investigación comercial: ver trabajos reales antes de contactar.',
  '/service-areas/': 'Navegacional: dónde trabaja la empresa.',
  '/service-areas/brooklyn-ny/': 'Local: contratista de acabados en Brooklyn, preguntas locales.',
  '/contact/': 'Transaccional: llamar, escribir, pedir presupuesto.',
  '/privacy/': 'Legal/informativa.',
  '/404': 'Sin intención (no indexable).',
};
for (const s of services) intents[`/services/${s.slug}/`] = `${s.keyword.intent} Principal: "${s.keyword.primary}". Secundarias: ${s.keyword.secondary.join('; ')}.`;

const esc = (v = '') => String(v).replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\|/g, '\\|');
const rows = pages
  .sort((a, b) => a.route.localeCompare(b.route))
  .map((p) => `| \`${p.route}\` | ${esc(intents[p.route])} | ${esc(p.title)} | ${esc(p.description)} | ${esc(p.h1[0])} | ${p.schema ?? '-'} | ${p.mainLinks.map((l) => `\`${l}\``).join(' ')} |`);
const draftRows = services
  .filter((s) => s.status !== 'published')
  .map((s) => `| \`/services/${s.slug}/\` | ${s.status} | ${esc(s.title)} | ${esc(s.keyword.primary)} | ${esc(s.evidence)} |`);

writeFileSync(
  new URL('../docs/page-matrix.md', import.meta.url),
  `# Matriz de páginas

Generada por \`npm run verify\` a partir del build de producción (${new Date().toISOString().slice(0, 10)}).
Las intenciones y palabras clave son **hipótesis editoriales**: no se basan en volúmenes ni dificultad medidos.

## Páginas públicas (${pages.length})

Todas las páginas comparten además los enlaces de cabecera (Services, Projects, Service Area, About, Contact, teléfono)
y de pie (7 servicios publicados, About, Projects, Brooklyn, Contact, Privacy, Instagram, Yelp).
La última columna lista solo los enlaces contextuales dentro de \`<main>\`.

| Ruta | Intención / hipótesis | Title | Meta description | H1 | JSON-LD | Enlaces internos en el contenido |
|---|---|---|---|---|---|---|
${rows.join('\n')}

## Páginas en borrador (excluidas de producción, sitemap y navegación)

| Ruta | Estado | Title | Palabra clave principal (hipótesis) | Respaldo / motivo |
|---|---|---|---|---|
${draftRows.join('\n')}
`
);
console.log(`wrote docs/page-matrix.md (${relative(process.cwd(), dist)})`);
