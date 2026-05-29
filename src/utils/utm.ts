/**
 * UTM 归因：首次入站从 URL 抓取 utm_* / referrer，写入 cookie 持久化 30 天，
 * 表单提交 / 下载行为埋点时一起带回，给销售运营做归因。
 */

const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
] as const;

export type UtmKey = (typeof UTM_KEYS)[number];
export type UtmPayload = Partial<Record<UtmKey, string>> & {
  landing_page?: string;
  referrer?: string;
};

const COOKIE_NAME = 'dynamia_attribution';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function writeCookie(name: string, value: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${MAX_AGE_SECONDS}; path=/; SameSite=Lax`;
}

function readPersisted(): UtmPayload | null {
  const raw = readCookie(COOKIE_NAME);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UtmPayload;
  } catch {
    return null;
  }
}

/**
 * Capture UTM/referrer on first visit. Subsequent visits without UTM keep prior attribution.
 * UTM keys present on a later visit override previous values (last-non-null wins per key).
 */
export function captureAttribution(): UtmPayload {
  if (typeof window === 'undefined') return {};
  const url = new URL(window.location.href);
  const incoming: UtmPayload = {};

  for (const key of UTM_KEYS) {
    const v = url.searchParams.get(key);
    if (v) incoming[key] = v;
  }

  const hasIncoming = Object.keys(incoming).length > 0;
  const persisted = readPersisted() ?? {};

  const merged: UtmPayload = { ...persisted, ...incoming };

  if (!persisted.landing_page) {
    merged.landing_page = `${url.pathname}${url.search}`;
  }
  if (!persisted.referrer && document.referrer) {
    try {
      const refHost = new URL(document.referrer).host;
      const sameSite = refHost === url.host;
      if (!sameSite) merged.referrer = document.referrer;
    } catch {
      /* invalid referrer */
    }
  }

  if (hasIncoming || !persisted.landing_page || !persisted.referrer) {
    writeCookie(COOKIE_NAME, JSON.stringify(merged));
  }
  return merged;
}

/** Read attribution for inclusion in form/telemetry payload. */
export function getAttribution(): UtmPayload {
  return readPersisted() ?? {};
}

/** Flatten attribution into form payload (prefixed keys) for /api/contact email body. */
export function attributionToPayload(): Record<string, string> {
  const a = getAttribution();
  const out: Record<string, string> = {};
  for (const k of UTM_KEYS) if (a[k]) out[`📊 ${k}`] = a[k] as string;
  if (a.landing_page) out['📊 landing_page'] = a.landing_page;
  if (a.referrer) out['📊 referrer'] = a.referrer;
  return out;
}
