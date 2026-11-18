'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { localizedPath } from '@/utils/i18n';

interface ConsentLabelProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export default function ConsentLabel({ checked, onChange }: ConsentLabelProps) {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <label className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400 leading-snug cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        required
        className="mt-0.5 h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary"
      />
      <span>
        {t.rich('enterprise.gate.consentLabel', {
          link: (chunks) => (
            <a href={localizedPath('/privacy-policy', locale)} target="_blank" className="text-primary underline">
              {chunks}
            </a>
          ),
        })}
      </span>
    </label>
  );
}
