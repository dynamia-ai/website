import {getTranslations} from 'next-intl/server';
import TextWithBreaks from '@/components/TextWithBreaks';
import '@/styles/legal.css';

export default async function CookiesPolicyPage() {
  const t = await getTranslations('cookiesPolicy');
  const footer = await getTranslations('footer');
  const sections = t.raw('sections');
  const policySections = Array.isArray(sections) ? sections : [];

  return (
    <div className="legal-page">
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">{t('title')}</div>
          <h1>{t('title')}</h1>
          <p className="lead">{t('lastUpdated')}</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap legal-body">
          <p>
            <TextWithBreaks text={t('intro')} />
          </p>

          {(policySections as Array<{title: string; content: string}>).map((section) => (
            <div className="legal-section" key={section.title}>
              <h2>{section.title}</h2>
              <div>
                <TextWithBreaks text={section.content} />
              </div>
            </div>
          ))}

          <p className="legal-footer-note">{footer('copyright')}</p>
        </div>
      </section>
    </div>
  );
}
