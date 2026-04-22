export const DEFAULT_COVER = '/images/videos/default-cover.png';
export const DEFAULT_COVER_EN = '/images/videos/default-cover-en.png';

export interface Video {
  id: string;
  titleKey: string;
  descriptionKey: string;
  thumbnail?: string;
  thumbnailEn?: string;
  videoUrl: string;
  videoType: 'native' | 'youtube' | 'bilibili';
  videoUrlEn?: string;
  videoTypeEn?: 'native' | 'youtube' | 'bilibili';
  duration: string;
  tags: string[];
}

export const videos: Video[] = [
  {
    id: 'product-overview',
    titleKey: 'videos.items.productOverview.title',
    descriptionKey: 'videos.items.productOverview.description',
    videoUrl: '//player.bilibili.com/player.html?bvid=BV1A7dNYAED5&autoplay=1&quality=80&danmaku=0',
    videoType: 'bilibili',
    videoUrlEn: 'https://www.youtube.com/embed/gxUobykvNH4?autoplay=1',
    videoTypeEn: 'youtube',
    duration: '5:12',
    tags: ['product'],
  },
  {
    id: 'gpu-oversell',
    titleKey: 'videos.items.gpuOversell.title',
    descriptionKey: 'videos.items.gpuOversell.description',
    videoUrl: '//player.bilibili.com/player.html?bvid=BV15jopBFEE6&autoplay=1&quality=80&danmaku=0',
    videoType: 'bilibili',
    videoUrlEn: 'https://www.youtube.com/embed/um1bnUhAVKw?autoplay=1',
    videoTypeEn: 'youtube',
    duration: '8:30',
    tags: ['product', 'enterprise'],
  },
];
