import {getLocale, getTranslations} from 'next-intl/server';
import SiteArrow from '@/components/layout/SiteArrow';
import GpuCatalogSearch from '@/components/pages/GpuCatalogSearch';
import {websitePath} from '@/lib/site/links';
import {localizedPath} from '@/utils/i18n';
import '@/styles/gpu-catalog.css';

export default async function GpuCatalogPage() {
  const t = await getTranslations('gpuCatalog');
  const locale = await getLocale();

  return (
    <div className="gpu-catalog">
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">{t('eyebrow')}</div>
          <h1>{t('title')}</h1>
          <p>{t('description')}</p>
          <div className="catalog-source">
            <a
              className="textlink"
              href="https://project-hami.io/docs/userguide/device-supported"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{t('matrix')}</span>
              <SiteArrow variant="link" />
            </a>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <GpuCatalogSearch />
          <div className="catalog-next">
            <h2>{t('boundary')}</h2>
            <p>{t('boundaryText')}</p>
            <div className="actions">
              <a className="btn primary" href={localizedPath(websitePath('/contact-sales'), locale)}>
                {t('contact')}
                <SiteArrow variant="button" />
              </a>
              <a
                className="textlink"
                href="https://docs.dynamia.ai"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>{t('docs')}</span>
                <SiteArrow variant="link" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
