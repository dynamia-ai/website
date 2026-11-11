import {notFound} from 'next/navigation';
import {getLocale, getTranslations} from 'next-intl/server';
import Link from 'next/link';
import {videos} from '@/data/videos';
import {websitePath} from '@/lib/site/links';
import {localizedPath} from '@/utils/i18n';

interface VideoDetailPageProps {
  videoId: string;
}

function normalizeEmbed(url: string): string {
  if (url.startsWith('//')) return `https:${url}`;
  return url.replace('autoplay=1', 'autoplay=0');
}

function externalWatchUrl(url: string, type: string): string | null {
  if (type === 'bilibili') {
    const match = url.match(/bvid=([^&]+)/i);
    return match ? `https://www.bilibili.com/video/${match[1]}/` : null;
  }
  if (type === 'youtube') {
    const match = url.match(/embed\/([^?]+)/);
    return match ? `https://www.youtube.com/watch?v=${match[1]}` : null;
  }
  return null;
}

export default async function VideoDetailPage({videoId}: VideoDetailPageProps) {
  const locale = await getLocale();
  const t = await getTranslations({locale, namespace: 'sitePages.videos'});
  const tVideos = await getTranslations({locale, namespace: 'videos'});
  const video = videos.find((item) => item.id === videoId);
  if (!video) notFound();

  const useEnPlayer = locale !== 'zh' && video.videoUrlEn;
  const embedUrl = normalizeEmbed(useEnPlayer ? video.videoUrlEn! : video.videoUrl);
  const videoType = useEnPlayer ? video.videoTypeEn || video.videoType : video.videoType;
  const watchUrl = externalWatchUrl(
    useEnPlayer ? video.videoUrlEn! : video.videoUrl,
    videoType,
  );
  const title = tVideos(video.titleKey);
  const description = tVideos(video.descriptionKey);

  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <div className="breadcrumb">
            <Link href={localizedPath(websitePath('/'), locale)}>{t('detail.home')}</Link>
            <span>/</span>
            <span>{t('crumb.current')}</span>
          </div>
          <div>
            <div className="eyebrow">{t('crumb.current')}</div>
            <h1>{title}</h1>
            <p className="lead">{description}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <Link className="textlink" href={localizedPath(websitePath('/videos'), locale)}>
            {t('detail.backToVideos')}
          </Link>
          <div className="video-player">
            <iframe
              src={embedUrl}
              title={title}
              allow="fullscreen; picture-in-picture"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
          <p className="video-player-note">
            {videoType === 'youtube' ? t('detail.hostedOnYoutube') : t('detail.hostedOnBilibili')}{' '}
            {watchUrl ? (
              <a href={watchUrl} target="_blank" rel="noopener">
                {videoType === 'youtube' ? t('detail.watchOnYoutube') : t('detail.watchOnBilibili')}
              </a>
            ) : null}
          </p>
        </div>
      </section>
    </>
  );
}
