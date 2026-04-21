'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Video } from '@/data/videos';

interface VideoPlayerProps {
  video: Video;
  onClose: () => void;
}

export default function VideoPlayer({ video, onClose }: VideoPlayerProps) {
  const { t } = useTranslation();

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
          {video.videoType === 'native' ? (
            <video
              src={video.videoUrl}
              controls
              autoPlay
              className="w-full aspect-video"
            >
              Your browser does not support the video tag.
            </video>
          ) : video.videoType === 'youtube' ? (
            <iframe
              src={video.videoUrl}
              className="w-full aspect-video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={t(video.titleKey)}
            />
          ) : (
            /* Bilibili embed */
            <iframe
              src={video.videoUrl}
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
