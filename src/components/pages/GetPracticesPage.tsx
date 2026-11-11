import {getLocale, getTranslations} from 'next-intl/server';
import {localizedPath} from '@/utils/i18n';
import {websitePath} from '@/lib/site/links';
import ContactForm from '@/components/layout/ContactForm';

export default async function GetPracticesPage() {
  const t = await getTranslations('sitePages.getPractices');
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
            <div className="practice-pack-preview">
              <strong>{t('aside.title')}</strong>
              <p>{t('aside.body1')}</p>
            </div>
            <p style={{fontSize: '13px'}}>{t('aside.body2')}</p>
            <a className="textlink" href={localizedPath(websitePath('/cases'), locale)}>{t('aside.back')}</a>
          </div>
          <div className="sales-form">
            <h2>{t('form.title')}</h2>
            <p>{t('form.subtitle')}</p>
            <ContactForm
              intent="practice"
              formId="practice-form"
              submitLabel={t('form.submit')}
              successMessage={t('form.success')}
            >
              <div className="form-grid">
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
                  <input type="email" name="email" required maxLength={254} autoComplete="email" placeholder={t('form.email.placeholder')} />
                </label>
                <label className="field">
                  {t('form.jobTitle.label')}
                  <input name="role" maxLength={120} autoComplete="organization-title" placeholder={t('form.jobTitle.placeholder')} />
                </label>
                <label className="field">
                  {t('form.phone.label')}
                  <input name="phone" maxLength={80} placeholder={t('form.phone.placeholder')} />
                </label>
                <fieldset className="practice-gpu full">
                  <legend>{t('form.gpus.label')}</legend>
                  <div className="gpu-options">
                    <label className="gpu-choice">
                      <input type="radio" name="gpu" value="尚未部署" required />
                      {t('form.gpus.options.none')}
                    </label>
                    <label className="gpu-choice">
                      <input type="radio" name="gpu" value="1–8 张" required />
                      {t('form.gpus.options.r1to8')}
                    </label>
                    <label className="gpu-choice">
                      <input type="radio" name="gpu" value="9–32 张" required />
                      {t('form.gpus.options.r9to32')}
                    </label>
                    <label className="gpu-choice">
                      <input type="radio" name="gpu" value="33–128 张" required />
                      {t('form.gpus.options.r33to128')}
                    </label>
                    <label className="gpu-choice">
                      <input type="radio" name="gpu" value="129–512 张" required />
                      {t('form.gpus.options.r129to512')}
                    </label>
                    <label className="gpu-choice">
                      <input type="radio" name="gpu" value="513 张及以上" required />
                      {t('form.gpus.options.r513plus')}
                    </label>
                  </div>
                </fieldset>
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
