'use client';

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface CaseStudyZhWrapperProps {
  children: React.ReactNode;
}

const CaseStudyZhWrapper: React.FC<CaseStudyZhWrapperProps> = ({ children }) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    i18n.changeLanguage('zh');
  }, [i18n]);

  return <>{children}</>;
};

export default CaseStudyZhWrapper;
