export const DEFAULT_COVER = '/images/videos/default-cover.png';

export interface Video {
  id: string;
  titleKey: string;
  descriptionKey: string;
  thumbnail?: string;
  videoUrl: string;
  videoType: 'native' | 'youtube' | 'bilibili';
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
    duration: '5:12',
    tags: ['product'],
  },
  {
    id: 'gpu-oversell',
    titleKey: 'videos.items.gpuOversell.title',
    descriptionKey: 'videos.items.gpuOversell.description',
    videoUrl: '//player.bilibili.com/player.html?bvid=BV1xddSBWEu3&autoplay=1&quality=80&danmaku=0',
    videoType: 'bilibili',
    duration: '8:30',
    tags: ['product', 'enterprise'],
  },
];
