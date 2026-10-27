# Datos y decisiones pendientes

Estado a 27 de octubre de 2026. Cada punto indica dónde se cambia en el código.

## Bloquean el lanzamiento

| # | Pendiente | Dónde se aplica |
|---|---|---|
| 1 | **Dominio de producción.** Sin él, `npm run build` falla a propósito. | `SITE_URL` en `.env` / hosting |
| 2 | **Logo original y colores corporativos.** La paleta actual es neutral provisional y el header usa un logotipo de texto. Falta favicon. | `src/styles/tokens.css` (`--brand-*`), `src/components/Wordmark.astro` |
| 3 | **Formulario:** funcionando. Envío real de prueba el 27-10-2026: Microsoft 365 lo aceptó para 2 destinatarios (negocio + copia `CONTACT_CC`). Pendiente: confirmar la llegada a ambas bandejas (y spam), decidir si la copia al proveedor web se mantiene, y antes de fin de diciembre de 2026 revisar la autenticación SMTP de Microsoft 365 o migrar a OAuth u otro proveedor. Recomendado para la entrega: activar DKIM en Microsoft 365 y publicar un registro DMARC para `clustermedia.marketing` (hoy solo tiene SPF). | Variables `SMTP_*`, `CONTACT_CC` en Vercel; `src/pages/api/estimate.ts` |
| 4 | Revisión legal de la política de privacidad (ya nombra Vercel y el envío por Microsoft 365 desde un buzón del proveedor web). | `src/pages/privacy.astro` |
| 5 | **Actualizar a Astro 7.4.x con Node ≥ 22.23.4** (avisos de seguridad de `npm audit`). | `package.json` |
| 6 | **Autoría y permiso de uso de las 32 fotos de Yelp** (las propuso el intermediario; el cliente solo autorizó expresamente los vídeos de Instagram). | `src/data/media.ts` |

## Confirmar con el cliente

| # | Pendiente | Efecto en el sitio |
|---|---|---|
| 7 | Teléfono, correo y horario (L–S 7:00–17:00, domingo cerrado). | `src/data/business.ts` |
| 8 | Métodos de pago publicados en Yelp: Zelle, Venmo, PayPal, Cash App. Ocultos hasta confirmar. | `business.payments.confirmed = true` |
| 9 | ¿Zonas además de Brooklyn? Hoy solo se anuncia Brooklyn. | Nueva página en `src/pages/service-areas/` solo con contenido propio |
| 10 | Servicios en borrador: carpintería de acabado, molduras, paneles decorativos, muebles empotrados, cubiertas de radiador. | `status` en `src/data/services.ts` |
| 11 | Puertas: ¿venden/suministran puertas (Yelp: "Door Sales/Installation") o solo instalan? | Textos de `door-installation` y `custom-doors` |
| 12 | Puertas a medida: ¿fabrican o encargan? Plazos. | `custom-doors` (hoy se dice "made or sourced") |
| 13 | Puertas francesas: fotos de proyectos reales (hoy no hay ninguna). | Galería de `french-door-installation` |
| 14 | Pintura: interior/exterior, superficies, preparación incluida. | `painting` (hoy alcance "a confirmar") |
| 15 | Refinishing: qué superficies y tratamientos. | `refinishing` (hoy alcance "a confirmar") |
| 16 | Decks: estructura, diseño, permisos, pavers, mantenimiento, materiales además de ipé. | `deck-building` (hoy en "Confirmed during the consultation") |
| 17 | ¿Estimados gratuitos? ¿Visitas? Condiciones. No usar "Free Estimate" hasta confirmar. | CTAs y FAQ |
| 18 | Propietario, razón social, años de experiencia, historia, licencias, seguros, garantías. Nada de esto se publica. | `about`, JSON-LD |
| 19 | Testimonios reales con permiso. No hay sección de reseñas. | Nueva sección |
| 20 | WhatsApp: ¿el número está habilitado? No se añadió. | `business.ts` |
| 21 | Fotos de mayor resolución (máx. actual 1000 px) y los MP4 originales de los reels, si quieren alojarlos. | `src/assets/photos/`, `media.ts` |
| 22 | Ficha de Google Business Profile (si existe) y reclamar el perfil de Yelp (figuraba "Unclaimed"). | `business.social` y `sameAs` en JSON-LD |

## Mejoras opcionales tras el lanzamiento

- Imagen Open Graph horizontal 1200×630 (hoy se usan fotos verticales del proyecto).
- Medir Core Web Vitals con PageSpeed Insights y, con tráfico, con CrUX/Search Console.
- Revisar la descripción de la foto 28: el inventario dice "puertas plegables", pero se ven puertas abatibles dobles; el sitio usa "paired closet doors".
