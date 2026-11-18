import {getLocale, getTranslations} from 'next-intl/server';
import SiteArrow from '@/components/layout/SiteArrow';
import {videos} from '@/data/videos';
import {localizedPath} from '@/utils/i18n';
import {websitePath} from '@/lib/site/links';
import '@/styles/videos.css';

export default async function VideosPage() {
  const t = await getTranslations('sitePages.videos');
  const tVideos = await getTranslations('videos');
  const locale = await getLocale();

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
            {videos.map((video) => {
              const title = tVideos(`items.${video.itemKey}.title`);
              const description = tVideos(`items.${video.itemKey}.description`);
              const duration = tVideos(`items.${video.itemKey}.duration`);

              return (
                <a
                  className="video-card"
                  href={localizedPath(websitePath(`/videos/${video.id}`), locale)}
                  aria-label={tVideos('watchAria', {title})}
                  key={video.id}
                >
                  <div className="video-cover">
                    {video.cover ? (
                      <img src={video.cover} alt="" loading="lazy" />
                    ) : null}
                    <span className="video-play" aria-hidden={true}>
                      {t('ui.play')}
                    </span>
                    <span className="video-duration">{duration}</span>
                  </div>
                  <div className="video-card-copy">
                    <h2>{title}</h2>
                    <p>{description}</p>
                    <span className="textlink">
                      {tVideos('watch')}
                      <SiteArrow variant="text" />
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
          <p className="video-update-note">{t('empty')}</p>
        </div>
      </section>
    </>
  );
}
