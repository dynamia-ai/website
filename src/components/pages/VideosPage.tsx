import {getLocale, getTranslations} from 'next-intl/server';
import {localizedPath} from '@/utils/i18n';
import {websitePath} from '@/lib/site/links';

export default async function VideosPage() {
  const t = await getTranslations('sitePages.videos');
  const locale = await getLocale();
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <div className="breadcrumb">
            <a href={localizedPath(websitePath("/"), locale)}>{t('crumb.home')}</a>
            <span>{t('ui.slash')}</span>
            <span>{t('crumb.resources')}</span>
          </div>
          <div className="">
            <div>
              <div className="eyebrow">{t('crumb.resources')}</div>
              <h1>{t('crumb.current')}</h1>
              <p className="lead">{t('hero.lead')}</p>
            </div>
          </div>
        </div>
      </section>
      <section className="section ">
        <div className="wrap">
          <div className="video-library">
            <a className="video-card" href={localizedPath(websitePath("/videos/product-overview"), locale)} aria-label={t('items.overview.aria')}>
              <div className="video-cover">
                <img src="/redesign/assets/e21fa5bd833c3276b91d.png" alt="" loading="lazy" />
                <span className="video-play" aria-hidden={true}>{t('ui.play')}</span>
                <span className="video-duration">{t('items.overview.duration')}</span>
              </div>
              <div className="video-card-copy">
                <h2>{t('items.overview.title')}</h2>
                <p>{t('items.overview.body')}</p>
                <span className="textlink">
                  {t('items.watch')}
                  <span aria-hidden={true}>{t('ui.arrow')}</span>
                </span>
              </div>
            </a>
            <a className="video-card" href={localizedPath(websitePath("/videos/gpu-oversell"), locale)} aria-label={t('items.oversell.aria')}>
              <div className="video-cover">
                <img src="/redesign/assets/e21fa5bd833c3276b91d.png" alt="" loading="lazy" />
                <span className="video-play" aria-hidden={true}>{t('ui.play')}</span>
                <span className="video-duration">{t('items.oversell.duration')}</span>
              </div>
              <div className="video-card-copy">
                <h2>{t('items.oversell.title')}</h2>
                <p>{t('items.oversell.body')}</p>
                <span className="textlink">
                  {t('items.watch')}
                  <span aria-hidden={true}>{t('ui.arrow')}</span>
                </span>
              </div>
            </a>
          </div>
          <p className="video-update-note">{t('empty')}</p>
        </div>
      </section>
    </>
  );
}
