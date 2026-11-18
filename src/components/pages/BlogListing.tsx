'use client';

import {FormEvent, useMemo, useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import BlogCard from '@/components/layout/BlogCard';
import {websitePath} from '@/lib/site/links';
import {localizedPath} from '@/utils/i18n';
import {
  blogCategoryFilters,
  CATEGORY_LABEL_KEYS,
  CATEGORY_SUBTITLE_KEYS,
  type BlogCategoryId,
  type LocalizedBlogPost,
} from '@/lib/site/blogData';
import '@/styles/blog.css';

const PAGE_SIZE = 6;

interface BlogListingProps {
  posts: LocalizedBlogPost[];
}

export default function BlogListing({posts}: BlogListingProps) {
  const t = useTranslations('sitePages.blog');
  const home = useTranslations('sitePages.home');
  const locale = useLocale();
  const dynamiaLogo = home('brand.logo');
  const [category, setCategory] = useState<BlogCategoryId>('all');
  const [query, setQuery] = useState('');
  const [draftQuery, setDraftQuery] = useState('');
  const [page, setPage] = useState(1);

  const categories = blogCategoryFilters();

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    return posts.filter((post) => {
      const categoryOk = category === 'all' || post.categoryId === category;
      if (!categoryOk) return false;
      if (!q) return true;
      const categoryLabel = t(CATEGORY_LABEL_KEYS[post.categoryId]);
      return [post.title, post.desc, categoryLabel, post.coverTitle, post.authorSearch]
        .join(' ')
        .toLocaleLowerCase()
        .includes(q);
    });
  }, [posts, category, query, t]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function selectCategory(next: BlogCategoryId) {
    setCategory(next);
    setPage(1);
  }

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuery(draftQuery);
    setPage(1);
  }

  function resetFilters() {
    setCategory('all');
    setQuery('');
    setDraftQuery('');
    setPage(1);
  }

  const pageNumbers = [...new Set([1, currentPage - 1, currentPage, currentPage + 1, pageCount])]
    .filter((n) => n >= 1 && n <= pageCount)
    .sort((a, b) => a - b);

  const resultLabel = `${query.trim() ? `“${query.trim()}” · ` : ''}${filtered.length}${t('resultSuffix')}`;

  return (
    <section className="blog-content">
      <div className="wrap blog-layout">
        <aside className="blog-sidebar">
          <div className="category-heading">{t('categoriesHeading')}</div>
          <div className="blog-filterbar" aria-label={t('categoriesAria')}>
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={item === category ? 'active' : ''}
                aria-pressed={item === category}
                onClick={() => selectCategory(item)}
              >
                {t(CATEGORY_LABEL_KEYS[item])}
              </button>
            ))}
          </div>
        </aside>

        <div className="blog-main">
          <form className="blog-search" role="search" onSubmit={onSearch}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="10" cy="10" r="6.5" />
              <path d="m15 15 6 6" />
            </svg>
            <input
              type="search"
              aria-label={t('searchAria')}
              placeholder={t('searchPlaceholder')}
              value={draftQuery}
              onChange={(event) => setDraftQuery(event.target.value)}
            />
            <button type="submit">{t('searchSubmit')}</button>
          </form>

          <div className="result-line">
            <span role="status" aria-live="polite">
              {resultLabel}
            </span>
            <span>{t('mostRecentFirst')}</span>
          </div>

          <div className="blog-grid">
            {pageItems.map((post) => {
              const subtitleKey = CATEGORY_SUBTITLE_KEYS[post.categoryId];
              const categoryLabel = t(CATEGORY_LABEL_KEYS[post.categoryId]);
              return (
                <BlogCard
                  key={post.slug}
                  href={localizedPath(websitePath(`/blog/${post.slug}`), locale)}
                  title={post.title}
                  desc={post.desc}
                  category={categoryLabel}
                  categoryId={post.categoryId}
                  date={post.date}
                  coverTitle={post.coverTitle}
                  coverSubtitle={subtitleKey ? t(subtitleKey) : undefined}
                  coverBrand={t('coverBrand')}
                  coverMarkAlt={t('coverMarkAlt')}
                  readMore={t('readMore')}
                  logoSrc={dynamiaLogo}
                />
              );
            })}

            {!pageItems.length ? (
              <div className="content-empty">
                <h3>{t('emptyTitle')}</h3>
                <p>{t('emptyBody')}</p>
                <button className="empty-reset" type="button" onClick={resetFilters}>
                  {t('emptyReset')}
                </button>
              </div>
            ) : null}
          </div>

          {pageCount > 1 ? (
            <div className="pagination" aria-label={t('paginationAria')}>
              <button
                type="button"
                disabled={currentPage === 1}
                aria-label={t('paginationPrev')}
                onClick={() => setPage(currentPage - 1)}
              >
                {t('paginationPrev')}
              </button>
              {pageNumbers.map((n, index) => {
                const prev = pageNumbers[index - 1];
                return (
                  <span key={n}>
                    {index && prev && n - prev > 1 ? <span>…</span> : null}
                    <button
                      type="button"
                      className={n === currentPage ? 'active' : ''}
                      aria-current={n === currentPage ? 'page' : undefined}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  </span>
                );
              })}
              <button
                type="button"
                disabled={currentPage === pageCount}
                aria-label={t('paginationNext')}
                onClick={() => setPage(currentPage + 1)}
              >
                {t('paginationNext')}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
