import {getLocale, getTranslations} from 'next-intl/server';
import {localizedPath} from '@/utils/i18n';
import {websitePath} from '@/lib/site/links';
import ContactForm from '@/components/layout/ContactForm';

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
              <div className="sales-point">
                <span className="icon"><svg viewBox="0 0 24 24" aria-hidden={true}><path d="m12 3 10 5-10 5L2 8z M2 12l10 5 10-5 M2 16l10 5 10-5"></path></svg></span>
                <div><h3>{t('highlights.pricing.title')}</h3></div>
              </div>
              <div className="sales-point">
                <span className="icon"><svg viewBox="0 0 24 24" aria-hidden={true}><path d="M6 6h12v12H6z M9 9h6v6H9z M9 3v3m6-3v3M9 18v3m6-3v3M3 9h3m-3 6h3m12-6h3m-3 6h3"></path></svg></span>
                <div><h3>{t('highlights.pricing.body')}</h3></div>
              </div>
              <div className="sales-point">
                <span className="icon"><svg viewBox="0 0 24 24" aria-hidden={true}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M19 8v6 M16 11h6 M20 21v-2a4 4 0 0 0-2-3.5"></path></svg></span>
                <div><h3>{t('highlights.support.title')}</h3></div>
              </div>
              <div className="sales-point">
                <span className="icon"><svg viewBox="0 0 24 24" aria-hidden={true}><path d="m8 6-6 6 6 6 m8-12 6 6-6 6 M14 3l-4 18"></path></svg></span>
                <div><h3>{t('highlights.support.body')}</h3></div>
              </div>
            </div>
            <a className="textlink" href={localizedPath(websitePath('/products?section=product-matrix'), locale)}>{t('highlights.capabilitiesLink')}</a>
          </div>
          <div className="sales-form">
            <h2>{t('form.title')}</h2>
            <p>{t('form.requiredHint')}</p>
            <ContactForm
              intent="pricing"
              formId="pricing-form"
              submitLabel={t('form.submit')}
              successMessage={t('form.success')}
              editLabel={t('form.edit')}
            >
              <div className="form-grid">
                <label className="field full">
                  {t('form.gpus.label')}
                  <select name="gpu" required defaultValue="">
                    <option value="">{t('form.gpus.placeholder')}</option>
                    <option>{t('form.gpus.options.r1to10')}</option>
                    <option>{t('form.gpus.options.r10to50')}</option>
                    <option>{t('form.gpus.options.r50to200')}</option>
                    <option>{t('form.gpus.options.gt200')}</option>
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
              <label className="pricing-consent" style={{display: 'flex', alignItems: 'flex-start', gap: '9px', fontSize: '12px', marginTop: '18px'}}>
                <input type="checkbox" name="consent" required style={{marginTop: '5px', flexShrink: 0}} />
                <span>
                  {t('form.consent.before')}
                  <a href={privacyHref} style={{textDecoration: 'underline'}}>{t('form.consent.privacy')}</a>
                  {t('form.consent.after')}
                </span>
              </label>
              <div hidden><input name="_gotcha" autoComplete="off" tabIndex={-1} /></div>
            </ContactForm>
          </div>
        </div>
      </section>
      <section className="section ">
        <div className="wrap">
          <div className="intro">
            <div>
              <div className="eyebrow">{t('cta.eyebrow')}</div>
              <h2>{t('cta.title')}</h2>
              <p>{t('cta.body')}</p>
            </div>
          </div>
          <a className="btn" href={localizedPath(websitePath('/products'), locale)}>{t('cta.link')}</a>
        </div>
      </section>
    </>
  );
}
