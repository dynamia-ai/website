'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import type { Video } from '@/data/videos';

interface VideoPlayerProps {
  video: Video;
  onClose: () => void;
}

export default function VideoPlayer({ video, onClose }: VideoPlayerProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isEn = locale === 'en';
  const videoUrl = (isEn && video.videoUrlEn) ? video.videoUrlEn : video.videoUrl;
  const videoType = (isEn && video.videoTypeEn) ? video.videoTypeEn : video.videoType;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div
        className="relative w-full max-w-5xl mx-4"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/80 hover:text-white text-sm flex items-center gap-1"
          aria-label={t('videos.player.close')}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {t('videos.player.close')}
        </button>

        <div className="rounded-xl overflow-hidden shadow-2xl bg-black">
          {videoType === 'native' ? (
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full aspect-video"
            >
              Your browser does not support the video tag.
            </video>
          ) : videoType === 'youtube' ? (
            <iframe
              src={videoUrl}
              className="w-full aspect-video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={t(video.titleKey)}
            />
          ) : (
            /* Bilibili embed */
            <iframe
              src={videoUrl}
              className="w-full aspect-video border-0"
              allowFullScreen
              title={t(video.titleKey)}
              allow="autoplay"
            />
          )}
        </div>
      </div>
    </div>
  );
}
