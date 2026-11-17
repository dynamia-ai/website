import {getLocale, getTranslations} from 'next-intl/server';
import SiteArrow from '@/components/layout/SiteArrow';
import {JsonLd, faqSchema} from '@/components/StructuredData';
import {CONTACT_EMAIL} from '@/config/app-config';
import {localizedPath} from '@/utils/i18n';
import {websitePath} from '@/lib/site/links';
import '@/styles/legal.css';

export default async function FaqPage() {
  const t = await getTranslations('faq');
  const locale = await getLocale();
  const questions = t.raw('questions') as Array<{question: string; answer: string}>;

  return (
    <div className="legal-page">
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">{t('title')}</div>
          <h1>{t('title')}</h1>
          <p className="lead">{t('subtitle')}</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap legal-body">
          <div className="legal-faq-list">
            {questions.map((faq) => (
              <article className="legal-faq-item" key={faq.question}>
                <h2>{faq.question}</h2>
                <p>{faq.answer}</p>
              </article>
            ))}
          </div>

          <div className="legal-cta">
            <h3>{t('ctaTitle')}</h3>
            <p>{t('ctaDescription')}</p>
            <div className="actions">
              <a className="btn primary" href={localizedPath(websitePath('/contact-sales'), locale)}>
                {t('ctaPrimary')}
                <SiteArrow variant="button" />
              </a>
              <a className="btn" href={`mailto:${CONTACT_EMAIL}`}>
                {t('ctaSecondary')}
              </a>
            </div>
          </div>
        </div>
      </section>

      <JsonLd data={faqSchema(questions)} />
    </div>
  );
}
