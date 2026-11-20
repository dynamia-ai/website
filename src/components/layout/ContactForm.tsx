'use client';

import {FormEvent, ReactNode, useEffect, useRef, useState} from 'react';
import Script from 'next/script';
import {useLocale, useTranslations} from 'next-intl';
import {submitContact, type ContactPayload} from '@/lib/site/contact';

type ContactIntent = 'sales' | 'pricing' | 'practice';

interface TurnstileApi {
  render: (element: HTMLElement, options: {
    sitekey: string;
    action: string;
    theme: 'auto';
    appearance: 'interaction-only';
    execution: 'execute';
    callback: (token: string) => void;
    'expired-callback': () => void;
    'error-callback': () => void;
  }) => string;
  execute: (widgetId: string) => void;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

interface ContactFormProps {
  intent: ContactIntent;
  formId: string;
  submitLabel: ReactNode;
  successMessage: string;
  editLabel?: string;
  children: ReactNode;
}

export default function ContactForm({
  intent,
  formId,
  submitLabel,
  successMessage,
  editLabel,
  children,
}: ContactFormProps) {
  const locale = useLocale();
  const t = useTranslations('siteShell');
  const [status, setStatus] = useState<'idle' | 'verifying' | 'submitting' | 'success' | 'error'>('idle');
  const [scriptReady, setScriptReady] = useState(false);
  const [scriptFailed, setScriptFailed] = useState(false);
  const [widgetReady, setWidgetReady] = useState(false);
  const turnstileContainer = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const verification = useRef<{resolve: (token: string) => void; reject: () => void} | null>(null);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const isSuccess = status === 'success';
  const verificationUnavailable = !turnstileSiteKey || scriptFailed;

  useEffect(() => {
    if (!turnstileSiteKey || scriptReady) return;
    const timeout = window.setTimeout(() => setScriptFailed(true), 10000);
    return () => window.clearTimeout(timeout);
  }, [scriptReady, turnstileSiteKey]);

  useEffect(() => {
    if (!scriptReady || !turnstileSiteKey || isSuccess || !turnstileContainer.current || !window.turnstile) return;
    const id = window.turnstile.render(turnstileContainer.current, {
      sitekey: turnstileSiteKey,
      action: 'contact',
      theme: 'auto',
      appearance: 'interaction-only',
      execution: 'execute',
      callback: (token) => {
        verification.current?.resolve(token);
        verification.current = null;
      },
      'expired-callback': () => {
        verification.current?.reject();
        verification.current = null;
      },
      'error-callback': () => {
        verification.current?.reject();
        verification.current = null;
      },
    });
    widgetId.current = id;
    setWidgetReady(true);
    return () => {
      window.turnstile?.remove(id);
      widgetId.current = null;
      setWidgetReady(false);
    };
  }, [scriptReady, isSuccess, turnstileSiteKey]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    for (const field of form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input[required], textarea[required]')) {
      if (field.type === 'checkbox' || field.type === 'radio') continue;
      const value = field.value.trim();
      if (!value) {
        field.setCustomValidity(t('contactFieldRequired'));
      } else if (field.minLength > 0 && value.length < field.minLength) {
        field.setCustomValidity(t('contactFieldTooShort', {count: field.minLength}));
      } else {
        field.setCustomValidity('');
      }
      if (!field.checkValidity()) {
        field.reportValidity();
        return;
      }
    }
    setStatus('verifying');

    const data = new FormData(form);
    const fields: ContactPayload = {locale};
    data.forEach((value, key) => {
      fields[key] = typeof value === 'string' ? value : value.name;
    });
    if (intent === 'pricing') fields.intent = 'pricing';
    else if (intent === 'practice') fields.intent = 'practice';
    else if (typeof fields.intent !== 'string' || !fields.intent) fields.intent = 'sales';

    try {
      if (!widgetId.current || !window.turnstile) throw new Error('Verification unavailable');
      const id = widgetId.current;
      const token = await new Promise<string>((resolve, reject) => {
        verification.current = {resolve, reject};
        window.turnstile?.execute(id);
      });
      fields['cf-turnstile-response'] = token;
      setStatus('submitting');
      const result = await submitContact(fields);
      if (!result.success) throw new Error(result.error || 'submit failed');
      form.reset();
      setStatus('success');
    } catch {
      setStatus('error');
      verification.current = null;
      if (widgetId.current) window.turnstile?.reset(widgetId.current);
    }
  }

  if (status === 'success') {
    return (
      <div
        className={intent === 'practice' ? 'practice-result' : 'sales-result'}
        role="status"
        tabIndex={-1}
        ref={(node) => node?.focus()}
      >
        <p>{successMessage}</p>
        {editLabel ? (
          <button className="btn" type="button" onClick={() => setStatus('idle')}>
            {editLabel}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <form id={formId} method="post" onSubmit={onSubmit} onInput={(event) => {
      const field = event.target;
      if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
        field.setCustomValidity('');
      }
    }}>
      {children}
      {turnstileSiteKey ? (
        <>
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
            strategy="afterInteractive"
            onReady={() => {
              setScriptReady(true);
              setScriptFailed(false);
            }}
            onError={() => setScriptFailed(true)}
          />
          <div ref={turnstileContainer} className="turnstile-container" />
        </>
      ) : null}
      <p className="form-footnote" role="status" hidden={!verificationUnavailable && status !== 'verifying'}>
        {verificationUnavailable ? t('contactVerificationUnavailable') : t('contactVerifying')}
      </p>
      <p className="form-footnote" role="alert" hidden={status !== 'error'}>
        {t('contactSubmitError')}
      </p>
      <button type="submit" className="btn primary" disabled={verificationUnavailable || !widgetReady || status === 'verifying' || status === 'submitting'}>
        {submitLabel}
      </button>
    </form>
  );
}
