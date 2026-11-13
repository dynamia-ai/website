'use client';

import {FormEvent, ReactNode, useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {submitContact, type ContactPayload} from '@/lib/site/contact';

type ContactIntent = 'sales' | 'pricing' | 'practice';

interface ContactFormProps {
  intent: ContactIntent;
  formId: string;
  submitLabel: string;
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
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus('submitting');

    const data = new FormData(form);
    const fields: ContactPayload = {locale};
    data.forEach((value, key) => {
      fields[key] = typeof value === 'string' ? value : value.name;
    });
    if (intent === 'pricing') fields.intent = 'pricing';
    else if (intent === 'practice') fields.intent = 'practice';
    else if (typeof fields.intent !== 'string' || !fields.intent) fields.intent = 'sales';

    try {
      const result = await submitContact(fields);
      if (!result.success) throw new Error(result.error || 'submit failed');
      form.reset();
      setStatus('success');
    } catch {
      setStatus('error');
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
    <form id={formId} method="post" onSubmit={onSubmit}>
      {children}
      <p className="form-footnote" role="alert" hidden={status !== 'error'}>
        {t('contactSubmitError')}
      </p>
      <button type="submit" className="btn primary" disabled={status === 'submitting'}>
        {submitLabel}
      </button>
    </form>
  );
}
