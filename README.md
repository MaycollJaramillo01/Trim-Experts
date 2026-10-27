# Trim Experts — sitio web

Sitio estático en Astro 6 + TypeScript para Trim Experts (Brooklyn, NY). Contenido público en inglés estadounidense.

- Matriz de páginas (ruta, intención, title, description, H1, JSON-LD, enlaces): [docs/page-matrix.md](docs/page-matrix.md)
- Datos y decisiones pendientes del cliente: [docs/pendientes.md](docs/pendientes.md)

## Requisitos

- Node **≥ 22.18** (Astro 6 pide ≥ 22.12; los scripts de verificación ejecutan `.ts` directamente desde 22.18).
- Recomendado antes de producción: Node **≥ 22.23.4** para poder actualizar a Astro 7.4.x (ver "Seguridad").

## Comandos

```bash
npm install
npm run dev            # http://localhost:4321 — muestra también los borradores
npm run check          # comprobación de tipos (astro check)
npm run build          # build de producción: exige SITE_URL, ejecuta check antes
npm run build:staging  # contenido de producción (sin borradores), pero noindex, robots bloqueado, sin sitemap ni canonicals
npm run build:review   # build de revisión: incluye borradores, todo noindex, robots bloqueado, sin sitemap
npm run verify         # tras `npm run build`: valida el dist y regenera docs/page-matrix.md
npm run preview        # sirve el último build
```

## Variables de entorno

Copiar `.env.example` a `.env`.

| Variable | Uso | Si está vacía |
|---|---|---|
| `SITE_URL` | Origen de producción (`https://dominio.com`). Canonicals, `og:url`, `og:image`, sitemap, JSON-LD y `robots.txt`. | `npm run build` falla a propósito. En dev/review no se emiten canonical, JSON-LD ni sitemap. |
| `PUBLIC_FORM_ENDPOINT` | URL que recibe el formulario (JSON). | El formulario **no se renderiza**: contacto muestra teléfono y un botón de email con plantilla. |

No se usa ningún dominio de ejemplo como respaldo.

## Modos y estados editoriales

Cada servicio en [src/data/services.ts](src/data/services.ts) tiene `status`: `draft`, `review` o `published`.

| Modo | Servicios generados | Indexación | Sitemap |
|---|---|---|---|
| `npm run dev` | todos (borradores con aviso visible) | `noindex` | no |
| `npm run build:review` | todos (borradores con aviso visible) | `noindex` + `robots.txt` Disallow | no |
| `npm run build:staging` | solo `published` | `noindex` + `robots.txt` Disallow | no |
| `npm run build` | solo `published` | indexable | sí |

Navegación, pie, tarjetas, enlaces relacionados y sitemap usan solo servicios publicados en producción.
Para publicar un borrador: cambiar su `status` a `published`, revisar su contenido y volver a construir.

Borradores actuales (implementados, fuera de producción): `finish-carpentry`, `crown-molding-trim`,
`decorative-wall-paneling`, `custom-built-ins`, `radiator-covers`.

## Estructura

```
src/
  data/business.ts   Nombre, teléfono, email, horario, área, redes, pagos, modo de build. Fuente única.
  data/services.ts   12 servicios: contenido, estado, fotos, FAQ, factores de coste, hipótesis de palabra clave, respaldo.
  data/media.ts      Inventario de las 32 fotos (nº original, id de Yelp, alt, etapa, grupo) y los 12 reels.
  lib/schema.ts      Constructores JSON-LD.
  lib/lead.ts        Validación del formulario (contrato compartido con el endpoint).
  styles/tokens.css  Tokens de diseño (color, tipo, espaciado). Paleta provisional.
  styles/global.css  Estilos.
  components/        Header, Footer, Wordmark, PageHero (+ migas de pan), Photo, Gallery (+ lightbox), Reels, CTA, FAQ,
                     ServiceCards, HowToRequest, ContactForm.
  layouts/Base.astro Head (SEO, OG, JSON-LD, precarga de fuentes), aviso de borrador.
  pages/             index, about, services/, services/[slug], projects, service-areas/, service-areas/brooklyn-ny, contact, privacy, 404, robots.txt
scripts/verify.mjs   Verificación post-build y generación de la matriz.
```

Preparado para español: `lang` centralizado en `business.ts` y contenido separado en módulos de datos.
No hay selector de idioma porque no existe versión traducida. Para añadirla: configurar `i18n` de Astro con prefijo `/es/` y duplicar los módulos de contenido.

## Identidad visual

**No se encontró el logo** en el material recibido. La paleta de [src/styles/tokens.css](src/styles/tokens.css) es neutral y provisional
(carbón `#1e2529` + neutros cálidos), no derivada del logo. El header usa un logotipo de texto ([src/components/Wordmark.astro](src/components/Wordmark.astro)).
Al recibir el logo: muestrear sus colores, sustituir `--brand-*`, reemplazar el Wordmark, añadir favicon y volver a comprobar contraste.

Contraste de la paleta actual (WCAG): texto 17.4:1, texto secundario 7.8:1 (7.2:1 sobre superficie), botón primario 15.5:1,
texto sobre fondo oscuro 13.9:1, insignias 7.4–7.6:1, borde de campos 7.8:1.

Tipografía: **Archivo** (titulares, botones, logotipo de texto) e **Inter** (texto), variables y autoalojadas con
`@fontsource-variable` (sin peticiones a Google Fonts). Solo se descarga el subconjunto latino (≈35 KB + 48 KB), precargado en `Base.astro`.

Héroes: la home usa fondo claro con foto; el resto de páginas usa `PageHero` (banda de color sólido de marca con migas de pan,
y foto enmarcada en servicios y About). Las fotos no se usan como fondo a pantalla completa porque miden como máximo 1000 px
y se verían ampliadas.

## Fotografías y vídeos

- Originales intactos en `../Trim_Experts/fotos/`. Copias con nombre descriptivo en `src/assets/photos/`.
  La correspondencia nº original → archivo → id de Yelp está en `src/data/media.ts`.
- Astro genera AVIF, WebP y JPG a 360/560 px y al ancho original (máx. 1000 px). **Nunca se amplía**.
- `width`/`height` siempre definidos; carga diferida salvo la imagen principal de cada página.
- Etapas visibles: "Completed" / "In progress" solo cuando la foto lo muestra; sin etiqueta si no está claro. Sin "antes y después".
- Alt y pies describen lo visible, sin ubicaciones ni materiales no verificables.
- Galería con lightbox en `<dialog>` nativo: Enter abre, foco en "Close", Escape cierra y devuelve el foco. Sin JS, el enlace abre la imagen.
- Reels: tarjetas con enlace directo a Instagram. "Play here" inserta el embed solo al pulsar (no se carga nada de Instagram antes). No hay MP4 locales.

## Formulario: contrato de integración

Estado actual: **sin endpoint** → el formulario no se muestra. Para activarlo, definir `PUBLIC_FORM_ENDPOINT` y reconstruir.

Petición del navegador:

```
POST {PUBLIC_FORM_ENDPOINT}
Content-Type: application/json
Accept: application/json

{
  "name": "string, 2–100",
  "email": "string, email válido, ≤254",
  "phone": "string, opcional; si existe 10–15 dígitos, solo dígitos, espacios, ( ) + . -",
  "service": "string, nombre de un servicio publicado u 'Other or not sure'",
  "location": "string, 2–120",
  "message": "string, 20–3000",
  "company_website": "honeypot: debe llegar vacío",
  "startedAt": 1793125516745
}
```

El endpoint debe:

1. Repetir la validación de [src/lib/lead.ts](src/lib/lead.ts) (no confiar en el cliente).
2. Rechazar si `company_website` no está vacío o si `Date.now() - startedAt < 3000` ms. Añadir límite de frecuencia por IP.
3. Entregar el mensaje a `Trimexperts1@gmail.com` (o al destino que el cliente indique).
4. Responder `2xx` **solo** si la entrega se aceptó; cualquier otro código muestra el estado de error.
5. Permitir CORS para el origen de `SITE_URL` (o servirse desde el mismo dominio).

El cliente muestra éxito únicamente ante un `2xx` real; en error conserva los datos y ofrece teléfono y email.
Al elegir proveedor, nombrarlo en `src/pages/privacy.astro`. No hay subida de archivos: las fotos se envían por email.

## SEO técnico

- Title y description únicos, un H1 por página, migas de pan visibles + `BreadcrumbList`.
- Canonical absoluto, Open Graph y `twitter:card` solo con `SITE_URL`.
- `sitemap-index.xml` (`@astrojs/sitemap`) solo en producción; contiene exactamente las 15 páginas indexables.
- `robots.txt`: permite y enlaza el sitemap en producción; `Disallow: /` en dev y review.
- JSON-LD con `@id` estables: `HomeAndConstructionBusiness` (`#business`), `WebSite` (`#website`), `BreadcrumbList`,
  `Service` (con `provider`, `areaServed` e `ImageObject`) y `FAQPage` (solo preguntas visibles).
- Sin dirección, coordenadas, valoraciones, precios ni licencias. **Limitación**: sin dirección, el negocio no es elegible
  para el resultado enriquecido de LocalBusiness de Google, y Google limita los resultados de FAQ a muy pocos sitios.
  El marcado describe la entidad; no garantiza resultados enriquecidos.
- Sin `llms.txt`: no es un requisito de posicionamiento y el sitemap + contenido semántico ya cubren el índice.
- Sin redirecciones: no existía un sitio anterior.

## Despliegue

### Vercel (estado actual)

Repositorio: `MaycollJaramillo01/Trim-Experts`, rama `main`, conectado a Vercel. [vercel.json](vercel.json) usa
`npm run build:staging` mientras no haya dominio: la URL `*.vercel.app` muestra el sitio público, pero no se indexa.

Al confirmar el dominio:

1. Añadir el dominio en Vercel (Settings → Domains) y redirigir el `*.vercel.app` hacia él.
2. Definir `SITE_URL=https://dominio` en Settings → Environment Variables (Production).
3. Cambiar `buildCommand` en `vercel.json` a `npm run build` y hacer push a `main`.
4. Comprobar `robots.txt`, `sitemap-index.xml` y un canonical, y enviar el sitemap a Search Console.

### Cualquier hosting estático

Netlify, Vercel, Cloudflare Pages, S3, etc.:

- Comando: `npm run build` · Carpeta: `dist/` · Node ≥ 22.18 (recomendado ≥ 22.23.4).
- Variables: `SITE_URL` (obligatoria) y `PUBLIC_FORM_ENDPOINT` (opcional).
- URLs con barra final (`trailingSlash: 'always'`); `404.html` en la raíz del `dist`.
- Después del primer despliegue: enviar el sitemap en Google Search Console y Bing Webmaster Tools.
- Para una URL de revisión del cliente, desplegar `npm run build:review` (no indexable).

## Seguridad

`npm audit` (27 oct 2026) reporta avisos en `astro ≤ 7.3.1` (XSS en renderizado de atributos/transiciones/MDX),
`sharp` (libvips, procesamiento de imágenes en build) y `esbuild` (servidor de desarrollo en Windows).
El sitio es estático, no renderiza datos de usuarios, no usa MDX ni transiciones, y `sharp` solo procesa fotos propias,
por lo que la exposición práctica es baja. Aun así, antes de producción: actualizar Node a ≥ 22.23.4 y Astro a 7.4.x,
y repetir `npm run build` + `npm run verify`. No se actualizó aquí porque el entorno local tiene Node 22.20.0.

## Verificación realizada (27 oct 2026)

Ejecutado en local con `SITE_URL=http://localhost:4321` (solo para inspección; ese `dist` no debe desplegarse):

- `astro check`: 0 errores, 0 avisos.
- `npm run build` sin `SITE_URL`: falla con el mensaje esperado.
- Build de producción: 16 páginas; `verify`: títulos/descriptions únicos, 1 H1 por página, canonicals correctos,
  JSON-LD válido y sin propiedades no verificadas, sin enlaces internos rotos, todas las imágenes existen,
  borradores no generados ni enlazados, sitemap = páginas indexables, sin "free estimate" ni teléfono +58.
- Build de revisión: 21 páginas, todas `noindex`, robots bloqueado, sin sitemap, aviso de borrador visible.
- Navegador (laboratorio): sin desbordamiento horizontal a 320 px en las 16 páginas; menú móvil (abre, Escape cierra y devuelve el foco);
  lightbox con teclado; embed de Instagram solo tras pulsar; formulario contra un endpoint simulado local:
  errores accesibles y foco en el primer campo inválido, éxito solo con `200`, error con `500` conservando los datos.
- Peso: CSS 24 KB (5,3 KB gzip), fuentes ≈ 83 KB (latin), JS propio inline ≈ 1,3–1,7 KB por página, sin JS de terceros al cargar.
- Rediseño (27 oct 2026): héroes sólidos en páginas interiores, Archivo + Inter, maquetación lateral en FAQ/respuestas;
  repetidos `astro check`, build de producción y revisión, `verify`, desbordamiento a 320 px en las 16 páginas y carga de fuentes.

No se midieron Core Web Vitals (LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1 son objetivos, no resultados).
Tras el despliegue: PageSpeed Insights (laboratorio) y, con tráfico suficiente, CrUX/Search Console (datos reales).
