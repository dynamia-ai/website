"use client";

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import HamiAiPlatformProduct from '../../../products/hami-ai-platform/page';

export default function ZhHamiAiPlatformProductPage() {
  const { i18n } = useTranslation();

  useEffect(() => {
    i18n.changeLanguage('zh');
  }, [i18n]);

  return <HamiAiPlatformProduct />;
}