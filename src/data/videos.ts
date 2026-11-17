export type VideoItemKey =
  | 'productOverview'
  | 'gpuOversell'
  | 'gpuSharing'
  | 'memoryAutoExpand';

export interface Video {
  id: string;
  itemKey: VideoItemKey;
  videoUrl: string;
  videoType: 'native' | 'youtube' | 'bilibili';
  videoUrlEn?: string;
  videoTypeEn?: 'native' | 'youtube' | 'bilibili';
}

/** Shared card cover for the videos library listing. */
export const VIDEO_LIST_COVER = '/redesign/assets/e21fa5bd833c3276b91d.png';

export const videos: Video[] = [
  {
    id: 'product-overview',
    itemKey: 'productOverview',
    videoUrl: '//player.bilibili.com/player.html?bvid=BV1A7dNYAED5&autoplay=1&quality=80&danmaku=0',
    videoType: 'bilibili',
    videoUrlEn: 'https://www.youtube.com/embed/gxUobykvNH4?autoplay=1',
    videoTypeEn: 'youtube',
  },
  {
    id: 'gpu-oversell',
    itemKey: 'gpuOversell',
    videoUrl: '//player.bilibili.com/player.html?bvid=BV15jopBFEE6&autoplay=1&quality=80&danmaku=0',
    videoType: 'bilibili',
    videoUrlEn: 'https://www.youtube.com/embed/um1bnUhAVKw?autoplay=1',
    videoTypeEn: 'youtube',
  },
  {
    id: 'gpu-sharing',
    itemKey: 'gpuSharing',
    videoUrl: '//player.bilibili.com/player.html?bvid=BV1nUsu6ZE1V&autoplay=1&quality=80&danmaku=0',
    videoType: 'bilibili',
  },
  {
    id: 'memory-auto-expand',
    itemKey: 'memoryAutoExpand',
    videoUrl: '//player.bilibili.com/player.html?bvid=BV1cmsu6bERu&autoplay=1&quality=80&danmaku=0',
    videoType: 'bilibili',
  },
];
