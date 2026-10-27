import { business } from '../data/business';

// JSON-LD builders. Only facts shown on the site: no address, geo, rating, price range or licenses.
// Without an address the business is not eligible for Google's LocalBusiness rich result; that is accepted.

export type Crumb = { name: string; path: string };

export function graph(site: URL, extra: object[] = []) {
  const id = (frag: string) => new URL(`/#${frag}`, site).href;
  const areaServed = { '@type': 'AdministrativeArea', name: business.area.full, sameAs: business.area.wikipedia };
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'HomeAndConstructionBusiness',
        '@id': id('business'),
        name: business.name,
        url: new URL('/', site).href,
        telephone: business.phone.schema,
        email: business.email,
        areaServed,
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: business.hours.days,
          opens: business.hours.opens,
          closes: business.hours.closes,
        },
        sameAs: [business.social.instagram, business.social.yelp],
      },
      {
        '@type': 'WebSite',
        '@id': id('website'),
        url: new URL('/', site).href,
        name: business.name,
        inLanguage: business.lang,
        publisher: { '@id': id('business') },
      },
      ...extra,
    ],
  };
}

export const businessRef = (site: URL) => ({ '@id': new URL('/#business', site).href });

export function breadcrumbs(site: URL, crumbs: Crumb[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: new URL(c.path, site).href,
    })),
  };
}

export function faqPage(faqs: { q: string; a: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}

export function serviceNode(
  site: URL,
  s: { name: string; description: string; path: string },
  image?: { url: string; caption: string; width: number; height: number }
) {
  const url = new URL(s.path, site).href;
  return {
    '@type': 'Service',
    '@id': `${url}#service`,
    name: `${s.name} in ${business.area.short}`,
    serviceType: s.name,
    description: s.description,
    url,
    provider: businessRef(site),
    areaServed: { '@type': 'AdministrativeArea', name: business.area.full, sameAs: business.area.wikipedia },
    ...(image && {
      image: { '@type': 'ImageObject', contentUrl: new URL(image.url, site).href, caption: image.caption, width: image.width, height: image.height },
    }),
  };
}
