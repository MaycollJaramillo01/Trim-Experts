// Contact form contract. The same rules must be enforced by the receiving endpoint (see README).
export interface Lead {
  name: string;
  email: string;
  phone: string;
  service: string;
  location: string;
  message: string;
}

export type LeadErrors = Partial<Record<keyof Lead, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateLead(lead: Lead): LeadErrors {
  const e: LeadErrors = {};
  const len = (v: string) => v.trim().length;
  if (len(lead.name) < 2 || len(lead.name) > 100) e.name = 'Enter your name.';
  if (!EMAIL.test(lead.email.trim()) || len(lead.email) > 254) e.email = 'Enter a valid email address, like name@example.com.';
  const digits = lead.phone.replace(/\D/g, '').length;
  if (lead.phone.trim() && (!/^[\d\s()+.-]+$/.test(lead.phone.trim()) || digits < 10 || digits > 15)) {
    e.phone = 'Enter a phone number with area code, or leave this blank.';
  }
  if (!lead.service.trim()) e.service = 'Choose the service closest to your project.';
  if (len(lead.location) < 2 || len(lead.location) > 120) e.location = 'Enter the neighborhood or address of the project.';
  if (len(lead.message) < 20) e.message = 'Describe the project in at least 20 characters.';
  else if (len(lead.message) > 3000) e.message = 'Keep the description under 3,000 characters.';
  return e;
}
