import {getLocale, getTranslations} from 'next-intl/server';
import ContactForm from '@/components/layout/ContactForm';
import {websitePath} from '@/lib/site/links';
import {localizedPath} from '@/utils/i18n';

export default async function ContactSalesPage() {
  const t = await getTranslations('sitePages.contactSales');
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
                <span className="icon"><svg viewBox="0 0 24 24" aria-hidden={true}><path d="M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z"></path></svg></span>
                <div>
                  <h3>{t('benefits.demo.title')}</h3>
                  <p>{t('benefits.demo.body')}</p>
                </div>
              </div>
              <div className="sales-point">
                <span className="icon"><svg viewBox="0 0 24 24" aria-hidden={true}><path d="M9 3h6v6H9z M3 15h6v6H3z M15 15h6v6h-6z M12 9v3 M6 15v-3h12v3"></path></svg></span>
                <div>
                  <h3>{t('benefits.products.title')}</h3>
                  <p>{t('benefits.products.body')}</p>
                </div>
              </div>
              <div className="sales-point">
                <span className="icon"><svg viewBox="0 0 24 24" aria-hidden={true}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M19 8v6 M16 11h6 M20 21v-2a4 4 0 0 0-2-3.5"></path></svg></span>
                <div>
                  <h3>{t('benefits.validation.title')}</h3>
                  <p>{t('benefits.validation.body')}</p>
                </div>
              </div>
            </div>
            <p style={{fontSize: '14px'}}>
              {t('direct.label')}
              <br />
              <a className="textlink" href="mailto:info@dynamia.ai">{t('direct.email')}</a>
              <br />
              <a href="tel:4000267800">{t('form.phone.error')}</a>
            </p>
          </div>
          <div className="sales-form">
            <h2>{t('form.title')}</h2>
            <p>{t('form.requiredHint')}</p>
            <ContactForm
              intent="sales"
              formId="sales-form"
              submitLabel={t('form.submit')}
              successMessage={t('form.success')}
            >
              <div className="form-grid">
                <label className="field full">
                  {t('form.intent.label')}
                  <select name="intent" required defaultValue="demo">
                    <option value="selfTrial">{t('form.intent.trial')}</option>
                    <option value="demo">{t('form.intent.demo')}</option>
                    <option value="sales">{t('form.intent.sales')}</option>
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
                <label className="field full">
                  {t('form.email.label')}
                  <input type="email" name="email" required autoComplete="email" placeholder={t('form.email.placeholder')} />
                </label>
                <label className="field">
                  {t('form.jobTitle.label')}
                  <input name="role" autoComplete="organization-title" placeholder={t('form.jobTitle.placeholder')} />
                </label>
                <label className="field">
                  {t('form.phone.label')}
                  <input name="phone" placeholder={t('form.phone.placeholder')} />
                </label>
                <label className="field full">
                  {t('form.product.label')}
                  <select name="product" required defaultValue="">
                    <option value="">{t('form.product.placeholder')}</option>
                    <option>{t('form.product.enterprise')}</option>
                    <option>{t('form.product.platform')}</option>
                    <option>{t('form.product.unsure')}</option>
                  </select>
                </label>
                <label className="field full">
                  {t('form.requirements.label')}
                  <textarea name="notes" required minLength={5} maxLength={2000} placeholder={t('form.requirements.placeholder')} />
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
    </>
  );
}
