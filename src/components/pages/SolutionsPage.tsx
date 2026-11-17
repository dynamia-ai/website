import {getLocale, getTranslations} from 'next-intl/server';
import SiteArrow from '@/components/layout/SiteArrow';
import {localizedPath} from '@/utils/i18n';
import {websitePath} from '@/lib/site/links';
import '@/styles/solutions.css';

interface SolutionCategory {
  title: string;
  description: string;
}

export default async function SolutionsPage() {
  const t = await getTranslations('solutions');
  const nav = await getTranslations('navigation');
  const locale = await getLocale();
  const categoriesRaw = t.raw('categories');
  const categories = Array.isArray(categoriesRaw)
    ? (categoriesRaw as SolutionCategory[])
    : [];

  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">{t('title')}</div>
          <h1>{t('title')}</h1>
          <p className="lead">{t('subtitle')}</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="solutions-grid">
            {categories.map((category) => (
              <article className="solutions-card" key={category.title}>
                <h3>{category.title}</h3>
                <p>{category.description}</p>
              </article>
            ))}
          </div>

          <div className="solutions-split">
            <div>
              <h2>{t('customSolutions.title')}</h2>
              <p>{t('customSolutions.description')}</p>
              <a className="btn primary" href={localizedPath(websitePath('/contact-sales'), locale)}>
                {t('customSolutions.contactButton')}
                <SiteArrow variant="button" />
              </a>
            </div>
            <div>
              <h3>{t('successStories.title')}</h3>
              <p>{t('successStories.subtitle')}</p>
              <a className="textlink" href={localizedPath(websitePath('/cases'), locale)}>
                <span>{t('successStories.viewAllButton')}</span>
                <SiteArrow variant="text" />
              </a>
            </div>
          </div>

          <div className="solutions-cta">
            <h2>{t('readyForChallenge')}</h2>
            <div className="actions">
              <a className="btn primary" href={localizedPath(websitePath('/contact-sales'), locale)}>
                {nav('freeTrial')}
                <SiteArrow variant="button" />
              </a>
              <a className="btn" href={localizedPath(websitePath('/cases'), locale)}>
                {t('successStories.viewAllButton')}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
