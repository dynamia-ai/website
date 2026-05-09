'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import EnterpriseDetailClient from '@/components/enterprise/EnterpriseDetailClient';

export default function ZhEnterpriseDetailPage() {
  const { i18n } = useTranslation();
  const params = useParams<{ productId: string }>();
  const [productId, setProductId] = useState<string | null>(null);

  useEffect(() => {
    i18n.changeLanguage('zh');
  }, [i18n]);

  useEffect(() => {
    if (params?.productId) {
      setProductId(typeof params.productId === 'string' ? params.productId : params.productId[0]);
    }
  }, [params]);

  if (!productId) return null;
  return <EnterpriseDetailClient productId={productId} locale="zh" />;
}
