import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const INTENT_LABELS: Record<string, string> = {
  selfTrial: '自助试用',
  demo: '申请演示',
  sales: '商务咨询',
};

const LOCALE_LABELS: Record<string, string> = {
  en: 'English',
  zh: '中文',
};

/* ─── Rate Limiting ─── */
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 10; // max requests per window per IP

function getClientIp(request: Request): string {
  // Prioritize x-real-ip because it is securely overwritten by the edge
  // network and cannot be spoofed by the client. Fall back to the first
  // entry of x-forwarded-for only when x-real-ip is absent.
  const xri = request.headers.get('x-real-ip');
  if (xri) {
    return xri.trim();
  }
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    return xff.split(',')[0].trim();
  }
  return 'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();

  // Periodically clean up expired entries to prevent memory leaks
  if (rateLimitMap.size > 1000) {
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  }

  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.count += 1;
  return { allowed: true };
}

/* ─── Validation helpers ─── */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitizeString(str: string, maxLen: number): string {
  return str.trim().slice(0, maxLen);
}

function escapeHtml(unsafe: unknown): string {
  if (unsafe === undefined || unsafe === null) {
    return '—';
  }
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ─── Email builder ─── */
function buildHtmlEmail(data: Record<string, string>, subject: string): string {
  const intentLabel = INTENT_LABELS[data.intent] || data.intent || '—';
  const fields: { label: string; value: string }[] = [
    ...(data.locale
      ? [{ label: '语言 / Locale', value: LOCALE_LABELS[data.locale] || data.locale }]
      : []),
    { label: '需求类型', value: intentLabel },
    { label: '姓名', value: data.name },
    { label: '公司', value: data.company },
    { label: '邮箱', value: data.email || '—' },
    { label: '电话/微信', value: data.phone || '—' },
    { label: '使用场景', value: data.useCase || '—' },
  ];

  const rows = fields
    .map(
      (f) => `
      <tr>
        <td style="padding:8px 12px;font-weight:600;color:#374151;background:#f9fafb;border-bottom:1px solid #e5e7eb;white-space:nowrap;">${escapeHtml(f.label)}</td>
        <td style="padding:8px 12px;color:#111827;border-bottom:1px solid #e5e7eb;">${escapeHtml(f.value)}</td>
      </tr>`,
    )
    .join('');

  return `
    <div style="max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="background:#1e40af;padding:20px 24px;border-radius:8px 8px 0 0;">
        <h2 style="margin:0;color:#fff;font-size:18px;">${escapeHtml(subject)}</h2>
      </div>
      <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;overflow:hidden;">
        ${rows}
      </table>
      <p style="margin-top:16px;font-size:12px;color:#9ca3af;">此邮件由 dynamia.ai 官网表单自动发送</p>
    </div>`;
}

export async function POST(request: Request) {
  try {
    /* 1. Rate limit by IP */
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests, please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfter) },
        },
      );
    }

    /* 2. Payload size guard */
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).length > 100 * 1024) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }

    /* 3. Parse JSON safely */
    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!parsedBody || typeof parsedBody !== 'object' || Array.isArray(parsedBody)) {
      return NextResponse.json({ error: 'JSON body must be an object' }, { status: 400 });
    }

    const body = parsedBody as Record<string, unknown>;

    /* 4. Honeypot check — silently accept to not tip off bots */
    const gotcha = body._gotcha;
    if (typeof gotcha === 'string' && gotcha.trim().length > 0) {
      return NextResponse.json({ success: true, honeypot: true }, { status: 200 });
    }

    const { _subject, _replyto, ...formDataRaw } = body;

    /* 5. Field validation */
    const name = typeof body.name === 'string' ? sanitizeString(body.name, 100) : '';
    const company = typeof body.company === 'string' ? sanitizeString(body.company, 200) : '';
    const email = typeof body.email === 'string' ? sanitizeString(body.email, 200) : '';
    const subject =
      typeof _subject === 'string' ? sanitizeString(_subject, 300) : 'New Form Submission';
    const replyTo =
      typeof _replyto === 'string' && _replyto.trim().length > 0
        ? sanitizeString(_replyto, 200)
        : undefined;

    // Only enforce required fields when they are explicitly sent (form submissions)
    if (body.name !== undefined && name.length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (body.company !== undefined && company.length === 0) {
      return NextResponse.json({ error: 'Company is required' }, { status: 400 });
    }
    if (email.length > 0 && !isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    if (replyTo !== undefined && !isValidEmail(replyTo)) {
      return NextResponse.json({ error: 'Invalid reply-to email format' }, { status: 400 });
    }

    /* 6. Build sanitized string-only record for email HTML */
    const formData: Record<string, string> = {};
    for (const [key, value] of Object.entries(formDataRaw)) {
      if (typeof value === 'string') {
        formData[key] = value.trim().slice(0, 1000);
      } else if (value !== undefined && value !== null) {
        formData[key] = String(value).slice(0, 500);
      }
    }

    // Use the sanitized and validated values for known fields
    if (body.name !== undefined) formData.name = name;
    if (body.company !== undefined) formData.company = company;
    if (body.email !== undefined) formData.email = email;
    if (typeof body.locale === 'string') {
      const locale = sanitizeString(body.locale, 10);
      if (locale === 'en' || locale === 'zh') {
        formData.locale = locale;
      }
    }

    const html = buildHtmlEmail(formData, subject);

    /* 7. Send email */
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: 'Dynamia AI <noreply@dynamia.ai>',
      to: 'info@dynamia.ai',
      replyTo,
      subject,
      html,
    });

    if (error) {
      console.error('Resend API error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    console.error('Email sending failed:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
