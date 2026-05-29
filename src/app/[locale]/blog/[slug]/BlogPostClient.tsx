"use client";

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { formatDate } from '@/lib/blog-client';
import { BlogPost } from '@/types/blog';
import TableOfContents from '@/components/TableOfContents';
import ImageLightbox from '@/components/ImageLightbox';
import Breadcrumb from '@/components/Breadcrumb';
import BlogShareSection from '@/components/BlogAIShareSection';
import { routing } from '@/i18n/routing';

interface BlogPostClientProps {
  enPost: (BlogPost & { content: string }) | null;
  zhPost: (BlogPost & { content: string }) | null;
}

export default function BlogPostClient({ enPost, zhPost }: BlogPostClientProps) {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const urlPrefix = locale === routing.defaultLocale ? '' : `/${locale}`;

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState({ src: '', alt: '' });

  const postMap: Record<string, typeof enPost> = { en: enPost, zh: zhPost, de: enPost };
  const post = postMap[locale];
  const blogListPath = `${urlPrefix}/blog`;
  const getBlogPostPath = (slug: string) => `${urlPrefix}/blog/${slug}`;
  
  // 如果当前语言的博客不存在，但另一个语言的博客存在，重定向到博客列表页
  useEffect(() => {
    if (!post && (enPost || zhPost)) {
      router.replace(blogListPath);
    }
  }, [locale, post, enPost, zhPost, router, blogListPath]);
  
  const displayPost = post;

  useEffect(() => {
    if (!displayPost) {
      return;
    }

    const container = document.querySelector('.blog-content');
    if (!container) {
      return;
    }

    const copyLabel = t('blogUI.copyCode');
    const copiedLabel = t('blogUI.copied');
    const failedLabel = t('blogUI.copyFailed');
    const ariaLabel = t('blogUI.copyAria');

    type CopyState = 'idle' | 'copied' | 'failed';

    const ensureButtonStructure = (btn: HTMLButtonElement) => {
      if (!btn.classList.contains('code-copy-enhanced')) {
        btn.innerHTML = '<span class="code-copy-icon" aria-hidden="true"></span><span class="code-copy-text"></span>';
        btn.classList.add('code-copy-enhanced');
      }
    };

    const setButtonLabel = (btn: HTMLButtonElement, label: string) => {
      const textSpan = btn.querySelector<HTMLSpanElement>('.code-copy-text');
      if (textSpan) {
        textSpan.textContent = label;
      } else {
        btn.textContent = label;
      }
    };

    const setButtonState = (btn: HTMLButtonElement, state: CopyState) => {
      btn.classList.toggle('copied', state === 'copied');
      btn.classList.toggle('copy-failed', state === 'failed');
      btn.setAttribute('data-copy-state', state);
    };

    const writeToClipboard = async (text: string) => {
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(text);
          return true;
        } catch {
          // fall back to legacy approach below
        }
      }

      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.setAttribute('readonly', '');
        textArea.style.position = 'absolute';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);

        const selection = document.getSelection();
        const selectedRange = selection?.rangeCount ? selection.getRangeAt(0) : null;

        textArea.select();
        const success = document.execCommand('copy');

        document.body.removeChild(textArea);

        if (selectedRange && selection) {
          selection.removeAllRanges();
          selection.addRange(selectedRange);
        }

        return success;
      } catch {
        return false;
      }
    };

    const cleanups: Array<() => void> = [];

    const ensureCodeBlockContainer = (preElement: HTMLElement): HTMLDivElement | null => {
      const parent = preElement.parentElement;
      if (!parent) {
        return null;
      }

      if (parent.classList.contains('code-block')) {
        return parent as HTMLDivElement;
      }

      const wrapper = document.createElement('div');
      wrapper.className = 'code-block';
      parent.insertBefore(wrapper, preElement);
      wrapper.appendChild(preElement);
      return wrapper;
    };

    const preElements = Array.from(container.querySelectorAll('pre'));

    preElements.forEach((pre) => {
      const preElement = pre as HTMLElement;
      const codeElement = preElement.querySelector('code');
      if (!codeElement) {
        return;
      }

      const containerEl = ensureCodeBlockContainer(preElement);
      if (!containerEl) {
        return;
      }

      let copyButton = containerEl.querySelector<HTMLButtonElement>('button.code-copy-button');

      if (!copyButton) {
        const existingInsidePre = preElement.querySelector<HTMLButtonElement>('button.code-copy-button');
        if (existingInsidePre) {
          copyButton = existingInsidePre;
          containerEl.appendChild(existingInsidePre);
        }
      }

      if (!copyButton) {
        copyButton = document.createElement('button');
        copyButton.type = 'button';
        copyButton.className = 'code-copy-button';
        containerEl.appendChild(copyButton);
      }

      ensureButtonStructure(copyButton);
      setButtonLabel(copyButton, copyLabel);
      setButtonState(copyButton, 'idle');
      copyButton.setAttribute('aria-label', ariaLabel);

      let resetTimeoutId: number | undefined;

      const handleCopy = async () => {
        if (resetTimeoutId) {
          window.clearTimeout(resetTimeoutId);
        }

        const success = await writeToClipboard(codeElement.textContent ?? '');

        if (success) {
          setButtonState(copyButton, 'copied');
          setButtonLabel(copyButton, copiedLabel);
        } else {
          setButtonState(copyButton, 'failed');
          setButtonLabel(copyButton, failedLabel);
        }

        resetTimeoutId = window.setTimeout(() => {
          setButtonState(copyButton, 'idle');
          setButtonLabel(copyButton, copyLabel);
        }, 2000);
      };

      copyButton.onclick = handleCopy;

      cleanups.push(() => {
        if (resetTimeoutId) {
          window.clearTimeout(resetTimeoutId);
        }
        if (copyButton) {
          copyButton.onclick = null;
        }
      });
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [displayPost, locale, t]);

  // Handle image clicks for lightbox
  useEffect(() => {
    const container = document.querySelector('.blog-content');
    if (!container) {
      return;
    }

    // Add cursor pointer style to all images within figures
    const images = container.querySelectorAll('figure img');
    images.forEach((img) => {
      (img as HTMLImageElement).style.cursor = 'pointer';
    });

    // Use event delegation for better performance and to avoid cleanup issues
    const handleImageClick = (e: Event) => {
      const target = e.target as HTMLImageElement;
      // Check if clicked element is an image within a figure
      if (target.tagName === 'IMG' &&
          target.closest('.blog-image-figure') &&
          container.contains(target)) {
        setLightboxImage({
          src: target.src,
          alt: target.alt || 'Image'
        });
        setLightboxOpen(true);
      }
    };

    container.addEventListener('click', handleImageClick);

    return () => {
      container.removeEventListener('click', handleImageClick);
    };
  }, [displayPost]);

  // 如果当前语言的博客不存在，但另一个语言的博客存在，显示加载状态（正在重定向）
  // 只有在两个语言的博客都不存在时，才显示 "Post Not Found"
  if (!post && (enPost || zhPost)) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-r-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">
              {t('blogUI.redirecting')}
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!displayPost) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t('blogUI.notFound')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              {t('blogUI.notFoundDesc')}
            </p>
            <Link 
              href={blogListPath}
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            >
              {t('blogUI.backToBlog')}
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <article className="py-8 sm:py-12 lg:py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Grid layout: 正文 + TOC */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_16rem] gap-8 xl:gap-12">
            {/* 左侧：正文内容 */}
            <div className="w-full min-w-0 xl:max-w-4xl">
              {/* Breadcrumb with structured data */}
              <div className="mb-6 sm:mb-8">
                <Breadcrumb
                  items={[
                    { label: t('blogUI.blog'), href: blogListPath },
                    { label: displayPost.title }
                  ]}
                />
              </div>

              {/* Header */}
              <motion.header
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8 sm:mb-12"
              >
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">
                  {displayPost.title}
                </h1>

                {/* Published Date */}
                <div className="mb-3 sm:mb-4 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                  <time dateTime={displayPost.date}>
                    {formatDate(displayPost.date, locale)}
                  </time>
                </div>

              </motion.header>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="blog-content mx-auto max-w-3xl lg:max-w-none"
                dangerouslySetInnerHTML={{ __html: displayPost.content }}
              />

              {/* Share Section */}
              <div className="mt-8 sm:mt-12">
                <BlogShareSection
                  title={displayPost.title}
                  url={getBlogPostPath(displayPost.slug)}
                />
              </div>

              {/* Back to blog */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700"
              >
                <Link
                  href={blogListPath}
                  className="inline-flex items-center text-primary hover:text-primary-dark transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  {t('blogUI.backToBlog')}
                </Link>
              </motion.div>
            </div>

            {/* 右侧：TOC - sticky 定位，只在 xl 以上显示 */}
            <aside className="hidden xl:block">
              <div className="sticky top-24">
                <TableOfContents toc={displayPost.toc || []} />
              </div>
            </aside>
          </div>
        </div>
      </article>

      {/* Image Lightbox */}
      <ImageLightbox
        isOpen={lightboxOpen}
        src={lightboxImage.src}
        alt={lightboxImage.alt}
        onClose={() => setLightboxOpen(false)}
      />
    </MainLayout>
  );
} 
