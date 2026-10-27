import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';
import { CONTACT_CC, CONTACT_TO, SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_USER } from 'astro:env/server';
import { business } from '../../data/business';
import { serviceOptions } from '../../data/services';
import { validateLead, type Lead } from '../../lib/lead';

// Contact form → email. Runs as a Vercel Function; every other page is static.
export const prerender = false;

// ponytail: in-memory per-instance limit, reset on cold start. Move to a shared store (e.g. Vercel KV/Upstash) if spam gets through.
const hits = new Map<string, number[]>();
const LIMIT = 5;
const WINDOW_MS = 10 * 60_000;

const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ');

// Fallback page for browsers without JavaScript (plain form POST).
const page = (message: string) => `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Trim Experts</title>
<body style="font-family:system-ui,sans-serif;max-width:36rem;margin:4rem auto;padding:0 1rem;line-height:1.6">
<p>${message}</p><p>Phone: <a href="${business.phone.href}">${business.phone.display}</a> · Email: <a href="mailto:${business.email}">${business.email}</a></p>
<p><a href="/contact/">Back to the contact page</a></p></body></html>`;

export const POST: APIRoute = async ({ request }) => {
  const isJson = (request.headers.get('content-type') ?? '').includes('application/json');
  const reply = (status: number, message: string, errors?: object) =>
    isJson
      ? Response.json({ ok: status < 300, message, errors }, { status })
      : new Response(page(message), { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } });

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) return reply(503, 'The contact form is not available right now.');

  let raw: Record<string, unknown>;
  try {
    raw = isJson ? await request.json() : Object.fromEntries(await request.formData());
  } catch {
    return reply(400, 'Your request could not be read.');
  }
  const field = (k: string) => (typeof raw[k] === 'string' ? (raw[k] as string).trim() : '');

  // Spam: hidden field filled, or sent faster than a person can fill the form.
  const startedAt = Number(raw.startedAt);
  if (field('company_website') || (startedAt && Date.now() - startedAt < 3000)) {
    return reply(400, 'Your request could not be sent.');
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) return reply(429, 'Too many requests. Please call or email Trim Experts directly.');
  hits.set(ip, [...recent, now]);

  const lead: Lead = {
    name: field('name'),
    email: field('email'),
    phone: field('phone'),
    service: field('service'),
    location: field('location'),
    message: field('message'),
  };
  const errors = validateLead(lead);
  if (!errors.service && !serviceOptions.includes(lead.service)) errors.service = 'Choose the service closest to your project.';
  if (Object.keys(errors).length) return reply(400, 'Please correct the highlighted fields.', errors);

  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    requireTLS: SMTP_PORT !== 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });

  try {
    const info = await transport.sendMail({
      from: { name: `${business.name} website`, address: SMTP_USER },
      to: CONTACT_TO || business.email,
      cc: CONTACT_CC || undefined,
      replyTo: { name: oneLine(lead.name), address: lead.email },
      subject: oneLine(`Estimate request: ${lead.service} - ${lead.name}`),
      text: [
        `New estimate request from the ${business.name} website.`,
        '',
        `Name: ${lead.name}`,
        `Email: ${lead.email}`,
        `Phone: ${lead.phone || '(not provided)'}`,
        `Service: ${lead.service}`,
        `Project location: ${lead.location}`,
        '',
        'Project description:',
        lead.message,
        '',
        'Reply to this email to answer the customer directly.',
      ].join('\n'),
    });
    // SMTP server's acceptance, for checking deliveries in Vercel's function logs (no customer data).
    console.log(`estimate form: sent ${info.messageId} accepted=${info.accepted.length} rejected=${info.rejected.length} ${info.response}`);
  } catch (err) {
    // Logged for Vercel's function logs; never includes credentials.
    console.error('estimate form: SMTP send failed:', (err as Error).message);
    return reply(502, 'Your request could not be sent.');
  }

  return reply(200, 'Your request was sent to Trim Experts. Thank you.');
};
