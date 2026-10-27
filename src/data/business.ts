// Single source of truth for business facts and build mode.
// Components read from here; never hard-code contact data elsewhere.
import { SMTP_HOST, SMTP_PASSWORD, SMTP_USER } from 'astro:env/server';

export const business = {
  name: 'Trim Experts',
  lang: 'en-US',
  tagline: 'Doors, closets, decks and finishing work in Brooklyn, NY',
  phone: {
    display: '(347) 632-6556',
    href: 'tel:+13476326556',
    schema: '+1-347-632-6556',
  },
  email: 'Trimexperts1@gmail.com',
  area: {
    name: 'Brooklyn',
    full: 'Brooklyn, New York',
    short: 'Brooklyn, NY',
    wikipedia: 'https://en.wikipedia.org/wiki/Brooklyn',
  },
  hours: {
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    opens: '07:00',
    closes: '17:00',
    label: 'Monday to Saturday, 7:00 AM to 5:00 PM',
    closedLabel: 'Closed Sunday',
    timezone: 'New York time',
  },
  social: {
    instagram: 'https://www.instagram.com/trim_experts/',
    yelp: 'https://www.yelp.com/biz/trim-experts-brooklyn',
  },
  // Same number as the phone; confirmed active on WhatsApp (2026-10-27).
  whatsapp: {
    number: '13476326556',
    message: "Hi Trim Experts, I'd like to discuss a project in Brooklyn.",
  },
  // Published on Yelp but not yet reconfirmed by the client: hidden until `confirmed` is true.
  payments: {
    methods: ['Zelle', 'Venmo', 'PayPal', 'Cash App'],
    confirmed: false,
  },
} as const;

export const whatsappHref = `https://wa.me/${business.whatsapp.number}?text=${encodeURIComponent(business.whatsapp.message)}`;

// The form renders only when SMTP is configured at build time, so it never appears without a way to send.
export const formEndpoint = SMTP_HOST && SMTP_USER && SMTP_PASSWORD ? '/api/estimate/' : '';

// dev and `--mode review` render draft pages; only `production` is indexable.
export const showDrafts = import.meta.env.DEV || import.meta.env.MODE === 'review';
export const isProductionMode = import.meta.env.MODE === 'production';

export function mailto(subject: string, body = '') {
  const q = new URLSearchParams({ subject, ...(body && { body }) }).toString().replace(/\+/g, '%20');
  return `mailto:${business.email}?${q}`;
}

export const emailTemplate = (service = '') =>
  [
    'Name:',
    'Phone:',
    `Service: ${service}`,
    'Project location (Brooklyn neighborhood or address):',
    'What you want to achieve:',
    'Approximate measurements:',
    '',
    'Please attach photos of the space.',
  ].join('\n');
