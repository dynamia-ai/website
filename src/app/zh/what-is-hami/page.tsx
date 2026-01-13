"use client";

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import WhatIsHamiPage from '../../what-is-hami/page';

export default function ZhWhatIsHamiPage() {
  const { i18n } = useTranslation();
  
  useEffect(() => {
    i18n.changeLanguage('zh');
  }, [i18n]);

  return <WhatIsHamiPage />;
} 