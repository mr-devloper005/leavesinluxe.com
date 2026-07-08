import { NextResponse } from 'next/server';

const FALLBACK_SITE_CODE = 'mysterycoder';
const FALLBACK_SITE_URL = 'https://mysterycoder.com';
const FALLBACK_SITE_NAME = 'Mystery Coder';
const REQUEST_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_PUBLIC_API_TIMEOUT_MS || 8000);

const trimString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const getMasterContactUrl = () => {
  const baseUrl = (
    process.env.NEXT_PUBLIC_MASTER_API_URL ||
    process.env.NEXT_PUBLIC_MASTER_API_BASE_URL ||
    process.env.NEXT_PUBLIC_MASTER_PANEL_URL ||
    'https://masterpanel.seoparadox.com'
  ).replace(/\/$/, '');
  const siteCode = process.env.NEXT_PUBLIC_SITE_CODE || FALLBACK_SITE_CODE;

  if (!siteCode || siteCode === 'your_site_code') {
    return null;
  }

  return `${baseUrl}/api/v1/public/${siteCode}/contact`;
};

export async function POST(request: Request) {
  let payload: Record<string, unknown>;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid request body.' }, { status: 400 });
  }

  const honeypot = trimString(payload.company);
  if (honeypot) {
    return NextResponse.json({ ok: true });
  }

  const name = trimString(payload.name);
  const email = trimString(payload.email).toLowerCase();
  const phone = trimString(payload.phone);
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || FALLBACK_SITE_NAME;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL;
  const subject = trimString(payload.subject) || `New contact request from ${siteName}`;
  const message = trimString(payload.message);

  if (!name || !email || !message) {
    return NextResponse.json(
      { ok: false, message: 'Name, email, and message are required.' },
      { status: 400 },
    );
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ ok: false, message: 'Please enter a valid email address.' }, { status: 400 });
  }

  const masterContactUrl = getMasterContactUrl();
  if (!masterContactUrl) {
    return NextResponse.json(
      { ok: false, message: 'Contact form is not configured for this site.' },
      { status: 500 },
    );
  }

  const sourceUrl = request.headers.get('referer') || `${siteUrl}/contact`;

  try {
    const response = await fetch(masterContactUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal:
        typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
          ? AbortSignal.timeout(Number.isFinite(REQUEST_TIMEOUT_MS) ? REQUEST_TIMEOUT_MS : 8000)
          : undefined,
      body: JSON.stringify({
        name,
        email,
        phone,
        subject,
        message,
        sourceUrl,
        meta: { siteName, siteUrl, form: 'contact-page' },
      }),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(
        { ok: false, message: data?.message || 'Unable to submit the contact request.' },
        { status: response.status },
      );
    }

    return NextResponse.json({ ok: true, message: 'Thanks. Your message has been received.' });
  } catch (error) {
    console.error('Contact submit failed', error);
    return NextResponse.json(
      { ok: false, message: 'Contact service is temporarily unavailable.' },
      { status: 502 },
    );
  }
}
