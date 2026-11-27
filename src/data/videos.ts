export type VideoItemKey =
  | 'productOverview'
  | 'gpuOversell'
  | 'gpuSharing'
  | 'memoryAutoExpand'
  | 'priorityPreemption'
  | 'resourcePool';

export interface Video {
  id: string;
  itemKey: VideoItemKey;
  /** Listing card cover; omit until brand delivers artwork. */
  cover?: string;
  videoUrl: string;
  videoType: 'native' | 'youtube' | 'bilibili';
  videoUrlEn?: string;
  videoTypeEn?: 'native' | 'youtube' | 'bilibili';
}

export function getVideoSource(video: Video, locale: string) {
  if (locale === 'zh') {
    return {url: video.videoUrl, type: video.videoType};
  }
  if (!video.videoUrlEn) return null;
  return {url: video.videoUrlEn, type: video.videoTypeEn ?? video.videoType};
}

/** Legacy shared poster for the first two library entries. */
const LEGACY_COVER = '/redesign/assets/e21fa5bd833c3276b91d.png';

export const videos: Video[] = [
  {
    id: 'product-overview',
    itemKey: 'productOverview',
    cover: LEGACY_COVER,
    videoUrl: '//player.bilibili.com/player.html?bvid=BV1A7dNYAED5&autoplay=1&quality=80&danmaku=0',
    videoType: 'bilibili',
    videoUrlEn: 'https://www.youtube.com/embed/gxUobykvNH4?autoplay=1',
    videoTypeEn: 'youtube',
  },
  {
    id: 'gpu-oversell',
    itemKey: 'gpuOversell',
    cover: LEGACY_COVER,
    videoUrl: '//player.bilibili.com/player.html?bvid=BV15jopBFEE6&autoplay=1&quality=80&danmaku=0',
    videoType: 'bilibili',
    videoUrlEn: 'https://www.youtube.com/embed/um1bnUhAVKw?autoplay=1',
    videoTypeEn: 'youtube',
  },
  {
    id: 'gpu-sharing',
    itemKey: 'gpuSharing',
    cover: '/images/videos/share.png',
    videoUrl: '//player.bilibili.com/player.html?bvid=BV1nUsu6ZE1V&autoplay=1&quality=80&danmaku=0',
    videoType: 'bilibili',
  },
  {
    id: 'memory-auto-expand',
    itemKey: 'memoryAutoExpand',
    cover: '/images/videos/auto-scale.png',
    videoUrl: '//player.bilibili.com/player.html?bvid=BV1cmsu6bERu&autoplay=1&quality=80&danmaku=0',
    videoType: 'bilibili',
  },
  {
    id: 'priority-preemption',
    itemKey: 'priorityPreemption',
    cover: '/images/videos/priority-preemption.jpg',
    videoUrl: '//player.bilibili.com/player.html?bvid=BV1F8sh6nEJf&autoplay=1&quality=80&danmaku=0',
    videoType: 'bilibili',
  },
  {
    id: 'resource-pool',
    itemKey: 'resourcePool',
    cover: '/images/videos/resource-pool.jpg',
    videoUrl: '//player.bilibili.com/player.html?bvid=BV1ZH1pzxE5w&autoplay=1&quality=80&danmaku=0',
    videoType: 'bilibili',
  },
];

export function videosForLocale(locale: string): Video[] {
  return videos.filter((video) => getVideoSource(video, locale));
}
