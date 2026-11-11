import {setRequestLocale} from 'next-intl/server';
import VideoDetailPage from '@/components/pages/VideoDetailPage';
import {videos} from '@/data/videos';
import {siteVideoMetadata} from '@/lib/site/metadata';
import MainLayout from '@/components/layout/MainLayout';

interface PageProps {
  params: Promise<{locale: string; videoId: string}>;
}

export function generateStaticParams() {
  return videos.map((video) => ({videoId: video.id}));
}

export async function generateMetadata({params}: PageProps) {
  const {locale, videoId} = await params;
  return siteVideoMetadata(videoId, locale);
}

export default async function Page({params}: PageProps) {
  const {locale, videoId} = await params;
  setRequestLocale(locale);
  return (
    <MainLayout>
      <VideoDetailPage videoId={videoId} />
    </MainLayout>
  );
}
