import {getLocale, getTranslations} from 'next-intl/server';
import SiteArrow from '@/components/layout/SiteArrow';
import ContactForm from '@/components/layout/ContactForm';
import {localizedPath} from '@/utils/i18n';
import {websitePath} from '@/lib/site/links';
import '@/styles/sales.css';

type HighlightId = 'pricing' | 'support';
type GpuOptionId = 'r1to10' | 'r10to50' | 'r50to200' | 'gt200';

interface HighlightItem {
  id: HighlightId;
  icon: string;
}

const HIGHLIGHTS: HighlightItem[] = [
  {id: 'pricing', icon: 'm12 3 10 5-10 5L2 8z M2 12l10 5 10-5 M2 16l10 5 10-5'},
  {id: 'support', icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M19 8v6 M16 11h6 M20 21v-2a4 4 0 0 0-2-3.5'},
];

const GPU_OPTIONS: GpuOptionId[] = ['r1to10', 'r10to50', 'r50to200', 'gt200'];

export default async function PricingPage() {
  const t = await getTranslations('sitePages.pricing');
  const locale = await getLocale();
  const privacyHref = localizedPath(websitePath('/privacy-policy'), locale);

  return (
    <>
      <section className="sales-page">
        <div className="wrap sales-layout">
          <div className="sales-copy">
            <div className="eyebrow">{t('hero.eyebrow')}</div>
            <h1>
              {t('hero.titleLine1')}
              <br />
              {t('hero.titleLine2')}
            </h1>
            <p>{t('hero.lead')}</p>
            <div className="sales-points">
              {HIGHLIGHTS.map((item) => (
                <div className="sales-point" key={item.id}>
                  <span className="icon">
                    <svg viewBox="0 0 24 24" aria-hidden={true}>
                      <path d={item.icon} />
                    </svg>
                  </span>
                  <div>
                    <h3>{t(`highlights.${item.id}.title`)}</h3>
                    <p>{t(`highlights.${item.id}.body`)}</p>
                  </div>
                </div>
              ))}
            </div>
            <a className="textlink" href={localizedPath(websitePath('/products?section=product-matrix'), locale)}>
              {t('highlights.capabilitiesLink')}
              <SiteArrow variant="text" />
            </a>
          </div>
          <div className="sales-form">
            <h2>{t('form.title')}</h2>
            <p>{t('form.requiredHint')}</p>
            <ContactForm
              intent="pricing"
              formId="pricing-form"
              submitLabel={
                <>
                  {t('form.submit')}
                  <SiteArrow variant="button" />
                </>
              }
              successMessage={t('form.success')}
              editLabel={t('form.edit')}
            >
              <div className="form-grid">
                <label className="field full">
                  {t('form.gpus.label')}
                  <select name="gpu" required defaultValue="">
                    <option value="">{t('form.gpus.placeholder')}</option>
                    {GPU_OPTIONS.map((id) => (
                      <option key={id} value={id}>
                        {t(`form.gpus.options.${id}`)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  {t('form.name.label')}
                  <input name="name" required maxLength={80} autoComplete="name" placeholder={t('form.name.placeholder')} />
                </label>
                <label className="field">
                  {t('form.company.label')}
                  <input name="company" required maxLength={120} autoComplete="organization" placeholder={t('form.company.placeholder')} />
                </label>
                <label className="field">
                  {t('form.jobTitle.label')}
                  <input name="role" required maxLength={100} autoComplete="organization-title" placeholder={t('form.jobTitle.placeholder')} />
                </label>
                <label className="field">
                  {t('form.phone.label')}
                  <input name="phone" required maxLength={80} placeholder={t('form.phone.placeholder')} />
                </label>
                <label className="field full">
                  {t('form.email.label')}
                  <input type="email" name="email" required maxLength={254} autoComplete="email" placeholder={t('form.email.placeholder')} />
                </label>
                <label className="field full">
                  {t('form.message.label')}
                  <textarea name="notes" maxLength={2000} placeholder={t('form.message.placeholder')} />
                </label>
              </div>
              <label className="pricing-consent">
                <input type="checkbox" name="consent" required />
                <span>
                  {t('form.consent.before')}
                  <a href={privacyHref}>{t('form.consent.privacy')}</a>
                  {t('form.consent.after')}
                </span>
              </label>
              <div hidden>
                <input name="_gotcha" autoComplete="off" tabIndex={-1} />
              </div>
            </ContactForm>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <div className="intro">
            <div>
              <div className="eyebrow">{t('cta.eyebrow')}</div>
              <h2>{t('cta.title')}</h2>
              <p>{t('cta.body')}</p>
            </div>
          </div>
          <a className="btn" href={localizedPath(websitePath('/products'), locale)}>
            {t('cta.link')}
            <SiteArrow variant="button" />
          </a>
        </div>
      </section>
    </>
  );
}
