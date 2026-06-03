'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isCompanyEmail } from '@/utils/validation';
import FormSuccessMessage from '@/components/FormSuccessMessage';

interface VideoGateModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export default function VideoGateModal({ onSuccess, onClose }: VideoGateModalProps) {
  const { t } = useTranslation();
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    company: '',
    jobTitle: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('idle');

    if (!isCompanyEmail(formState.email)) {
      alert(t('common.useCompanyEmail'));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          '📹 来源': '官网视频页面 (Website Video Gate)',
          name: formState.name,
          email: formState.email,
          company: formState.company,
          jobTitle: formState.jobTitle,
          message: formState.message,
          _subject: `[官网视频] Video Access Request - ${formState.company}`,
          _replyto: formState.email,
          _gotcha: '',
        }),
      });

      if (response.ok) {
        document.cookie = 'video_unlocked=1; max-age=2592000; path=/';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full mx-4 p-8 relative max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#76b900]/10 mb-3">
            <svg className="h-6 w-6 text-[#76b900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {t('videos.gate.title')}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('videos.gate.subtitle')}
          </p>
        </div>

        {submitStatus === 'success' && (
          <FormSuccessMessage translationKey="videos.gate.success" />
        )}

        {submitStatus === 'error' && (
          <FormSuccessMessage translationKey="videos.gate.error" isError />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="gate-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('freeTrial.form.name')}
            </label>
            <input
              type="text"
              id="gate-name"
              name="name"
              value={formState.name}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="gate-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('freeTrial.form.email')}
            </label>
            <input
              type="email"
              id="gate-email"
              name="email"
              value={formState.email}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="gate-company" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('freeTrial.form.company')}
            </label>
            <input
              type="text"
              id="gate-company"
              name="company"
              value={formState.company}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="gate-jobTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('freeTrial.form.jobTitle')}
            </label>
            <input
              type="text"
              id="gate-jobTitle"
              name="jobTitle"
              value={formState.jobTitle}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="gate-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('freeTrial.form.message')}
            </label>
            <textarea
              id="gate-message"
              name="message"
              value={formState.message}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-primary focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors ${
              isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? t('freeTrial.form.submitting') : t('videos.gate.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
