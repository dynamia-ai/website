import {getTranslations} from 'next-intl/server';
import CareersBoard from '@/components/pages/CareersBoard';

export default async function CareersPage() {
  const t = await getTranslations('sitePages.careers');

  return (
    <>
      <section className="career-intro">
        <div className="wrap">
          <div className="career-page-label">{t('hero.label')}</div>
          <h1>{t('hero.title')}</h1>
          <p>{t('hero.description')}</p>
        </div>
      </section>
      <CareersBoard />
    </>
  );
}
