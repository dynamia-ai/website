"use client";

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import VideosPage from '../../videos/page';

export default function ZhVideosPage() {
  const { i18n } = useTranslation();

  useEffect(() => {
    i18n.changeLanguage('zh');
  }, [i18n]);

  return <VideosPage />;
}
