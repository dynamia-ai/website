'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import VideoGateModal from '@/components/videos/VideoGateModal';
import VideoPlayer from '@/components/videos/VideoPlayer';
import { videos, DEFAULT_COVER, DEFAULT_COVER_EN, type Video } from '@/data/videos';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function VideosPage() {
  const { t, i18n } = useTranslation();
  const [unlocked, setUnlocked] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const [pendingVideo, setPendingVideo] = useState<Video | null>(null);
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);

  useEffect(() => {
    setUnlocked(document.cookie.includes('video_unlocked=1'));
  }, []);

  const handlePlay = (video: Video) => {
    if (unlocked) {
      setPlayingVideo(video);
    } else {
      setPendingVideo(video);
      setShowGate(true);
    }
  };

  const handleGateSuccess = () => {
    setUnlocked(true);
    setShowGate(false);
    if (pendingVideo) {
      setPlayingVideo(pendingVideo);
      setPendingVideo(null);
    }
  };

  return (
    <MainLayout>
      {/* Hero */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-gray-100">
              {t('videos.pageTitle')}
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              {t('videos.pageSubtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Video Grid */}
      <section className="py-12 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video, index) => (
              <motion.div
                key={video.id}
                className="h-full"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div
                  className="h-full flex flex-col bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => handlePlay(video)}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                    <Image
                      src={i18n.language === 'en' ? (video.thumbnailEn || DEFAULT_COVER_EN) : (video.thumbnail || DEFAULT_COVER)}
                      alt={t(video.titleKey)}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                      <div className="w-16 h-16 rounded-full bg-white/90 dark:bg-white/80 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                        <svg className="h-8 w-8 text-[#76b900] ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                    {/* Duration badge */}
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                    {/* Lock indicator */}
                    {!unlocked && (
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        {t('videos.locked')}
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {t(video.titleKey)}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {t(video.descriptionKey)}
                    </p>
                    <div className="mt-auto flex flex-wrap gap-2 pt-3">
                      {video.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-xs bg-[#76b900]/10 text-[#76b900] px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gate Modal */}
      {showGate && (
        <VideoGateModal
          onSuccess={handleGateSuccess}
          onClose={() => { setShowGate(false); setPendingVideo(null); }}
        />
      )}

      {/* Video Player */}
      {playingVideo && (
        <VideoPlayer
          video={playingVideo}
          onClose={() => setPlayingVideo(null)}
        />
      )}
    </MainLayout>
  );
}
