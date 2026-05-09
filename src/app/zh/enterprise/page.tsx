'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import EnterpriseListClient from '@/components/enterprise/EnterpriseListClient';

export default function ZhEnterpriseListPage() {
  const { i18n } = useTranslation();

  useEffect(() => {
    i18n.changeLanguage('zh');
  }, [i18n]);

  return <EnterpriseListClient locale="zh" />;
}
