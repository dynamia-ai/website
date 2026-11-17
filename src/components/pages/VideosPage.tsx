import {getLocale, getTranslations} from 'next-intl/server';
import SiteArrow from '@/components/layout/SiteArrow';
import {videos} from '@/data/videos';
import {localizedPath} from '@/utils/i18n';
import {websitePath} from '@/lib/site/links';
import '@/styles/videos.css';

const VIDEO_CARDS = [
  {
    id: 'product-overview',
    copyKey: 'overview' as const,
    cover: '/redesign/assets/e21fa5bd833c3276b91d.png',
  },
  {
    id: 'gpu-oversell',
    copyKey: 'oversell' as const,
    cover: '/redesign/assets/e21fa5bd833c3276b91d.png',
  },
];

export default async function VideosPage() {
  const t = await getTranslations('sitePages.videos');
  const locale = await getLocale();
  const cards = VIDEO_CARDS.filter((card) => videos.some((video) => video.id === card.id));

  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <div className="breadcrumb">
            <a href={localizedPath(websitePath('/'), locale)}>{t('crumb.home')}</a>
            <span>{t('ui.slash')}</span>
            <span>{t('crumb.resources')}</span>
          </div>
          <div>
            <div className="eyebrow">{t('crumb.resources')}</div>
            <h1>{t('crumb.current')}</h1>
            <p className="lead">{t('hero.lead')}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="video-library">
            {cards.map((card) => (
              <a
                className="video-card"
                href={localizedPath(websitePath(`/videos/${card.id}`), locale)}
                aria-label={t(`items.${card.copyKey}.aria`)}
                key={card.id}
              >
                <div className="video-cover">
                  <img src={card.cover} alt="" loading="lazy" />
                  <span className="video-play" aria-hidden={true}>
                    {t('ui.play')}
                  </span>
                  <span className="video-duration">{t(`items.${card.copyKey}.duration`)}</span>
                </div>
                <div className="video-card-copy">
                  <h2>{t(`items.${card.copyKey}.title`)}</h2>
                  <p>{t(`items.${card.copyKey}.body`)}</p>
                  <span className="textlink">
                    {t('items.watch')}
                    <SiteArrow variant="text" />
                  </span>
                </div>
              </a>
            ))}
          </div>
          <p className="video-update-note">{t('empty')}</p>
        </div>
      </section>
    </>
  );
}
