'use client';

import {useTranslations} from 'next-intl';
import QrDialog from '@/components/layout/QrDialog';

export default function CommunityWeChatCard() {
  const t = useTranslations('sitePages.community');

  return (
    <QrDialog
      namespace="community"
      dialogClassName="qr-dialog"
      dialogId="community-qr"
      titleId="community-qr-title"
      trigger={(open) => (
        <button className="social-card" type="button" data-community-wechat="" onClick={open}>
          <img src="/redesign/assets/8a29ffa502745afa1684.svg" alt="" />
          <strong>{t('channels.wechat.name')}</strong>
          <span>{t('channels.wechat.hint')}</span>
        </button>
      )}
    />
  );
}
