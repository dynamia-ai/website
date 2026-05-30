'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { isCompanyEmail } from '@/utils/validation';
import { attributionToPayload } from '@/utils/utm';
import FormSuccessMessage from '@/components/FormSuccessMessage';
import ConsentLabel from '@/components/enterprise/ConsentLabel';

interface PendingDownloadContext {
  productId: string;
  productName: string;
  version: string;
  artifactType: string;
  artifactLabel: string;
}

interface DownloadGateModalProps {
  context: PendingDownloadContext | null;
  onSuccess: () => void;
  onClose: () => void;
}

export default function DownloadGateModal({
  context,
  onSuccess,
  onClose,
}: DownloadGateModalProps) {
  const t = useTranslations();
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    company: '',
    jobTitle: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [consent, setConsent] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('idle');

    if (!isCompanyEmail(formState.email)) {
      alert(t('common.useCompanyEmail'));
      return;
    }
    if (!consent) {
      alert(t('enterprise.gate.consentRequired'));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          '📦 来源': '官网企业版下载页 (Enterprise Download Gate)',
          '产品': context?.productName ?? '',
          '版本': context?.version ?? '',
          '下载介质': context?.artifactLabel ?? '',
          name: formState.name,
          email: formState.email,
          company: formState.company,
          jobTitle: formState.jobTitle,
          message: formState.message,
          ...attributionToPayload(),
          _subject: `[企业版下载登记] ${context?.productName ?? ''} ${context?.version ?? ''} - ${formState.company}`,
          _replyto: formState.email,
        }),
      });

      if (response.ok) {
        document.cookie = 'download_unlocked=1; max-age=2592000; path=/';
        setSubmitStatus('success');
        setTimeout(() => onSuccess(), 800);
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full mx-4 p-8 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
            <svg
              className="h-6 w-6 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {t('enterprise.gate.title')}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('enterprise.gate.subtitle')}
          </p>
          {context && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300">
              <span className="font-medium">{context.productName}</span>
              <span className="text-gray-400">·</span>
              <span>{context.version}</span>
              <span className="text-gray-400">·</span>
              <span>{context.artifactLabel}</span>
            </div>
          )}
        </div>

        {submitStatus === 'success' && (
          <FormSuccessMessage translationKey="enterprise.gate.success" />
        )}

        {submitStatus === 'error' && (
          <FormSuccessMessage translationKey="enterprise.gate.error" isError />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="dl-gate-name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('freeTrial.form.name')}
            </label>
            <input
              type="text"
              id="dl-gate-name"
              name="name"
              value={formState.name}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label
              htmlFor="dl-gate-email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('freeTrial.form.email')}
            </label>
            <input
              type="email"
              id="dl-gate-email"
              name="email"
              value={formState.email}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label
              htmlFor="dl-gate-company"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('freeTrial.form.company')}
            </label>
            <input
              type="text"
              id="dl-gate-company"
              name="company"
              value={formState.company}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label
              htmlFor="dl-gate-jobTitle"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('freeTrial.form.jobTitle')}
            </label>
            <input
              type="text"
              id="dl-gate-jobTitle"
              name="jobTitle"
              value={formState.jobTitle}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label
              htmlFor="dl-gate-message"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('freeTrial.form.message')}
            </label>
            <textarea
              id="dl-gate-message"
              name="message"
              value={formState.message}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-primary focus:border-primary"
            />
          </div>
          <ConsentLabel checked={consent} onChange={setConsent} />

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors ${
              isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? t('freeTrial.form.submitting') : t('enterprise.gate.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}

export type { PendingDownloadContext };
