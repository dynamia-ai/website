'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

interface FormSuccessMessageProps {
  translationKey: string;
  isError?: boolean;
}

export default function FormSuccessMessage({ translationKey, isError = false }: FormSuccessMessageProps) {
  const t = useTranslations();

  return (
    <div className={`mb-6 p-4 rounded-md border ${
      isError
        ? "bg-red-50 text-red-700 border-red-200"
        : "bg-green-50 text-green-700 border-green-200"
    }`}>
      {t(translationKey)}
    </div>
  );
} 