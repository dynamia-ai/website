'use client';

import {FormEvent, useMemo, useState} from 'react';
import Link from 'next/link';
import {useLocale, useTranslations} from 'next-intl';
import {websitePath} from '@/lib/site/links';
import {localizedPath} from '@/utils/i18n';
import {
  blogCategoryFilters,
  CATEGORY_SUBTITLE_KEYS,
  formatBlogDate,
  localizedBlogPosts,
  type BlogCategoryId,
} from '@/lib/site/blogData';

const PAGE_SIZE = 6;

const CATEGORY_KEY: Record<string, string> = {
  全部: 'categories.all',
  实践案例: 'categories.practice',
  技术博客: 'categories.tech',
  产品解读: 'categories.product',
  公司新闻: 'categories.company',
  版本发布: 'categories.release',
  社区与动态: 'categories.community',
};

export default function BlogListing() {
  const t = useTranslations('sitePages.blog');
  const locale = useLocale();
  const [category, setCategory] = useState<BlogCategoryId>('全部');
  const [query, setQuery] = useState('');
  const [draftQuery, setDraftQuery] = useState('');
  const [page, setPage] = useState(1);

  const posts = useMemo(() => localizedBlogPosts(locale), [locale]);
  const categories = blogCategoryFilters();

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    return posts.filter((post) => {
      const categoryOk = category === '全部' || post.categoryId === category;
      if (!categoryOk) return false;
      if (!q) return true;
      return [post.title, post.desc, post.category, post.coverTitle, post.authorSearch]
        .join(' ')
        .toLocaleLowerCase()
        .includes(q);
    });
  }, [posts, category, query]);

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
    setCategory('全部');
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
                  {t(CATEGORY_KEY[item])}
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
                return (
                  <Link
                    key={post.id}
                    className="blog-card"
                    href={localizedPath(websitePath(`/blog/${post.slug}`), locale)}
                  >
                    <div className="content-cover editorial-cover" data-category={post.categoryId}>
                      <div className="text-cover">
                        <div className="cover-topline">
                          <img
                            className="cover-mark"
                            src="/redesign/assets/cf10a2fcc13438169897.svg"
                            alt={t('coverMarkAlt')}
                          />
                          <span className="cover-category">{post.category}</span>
                        </div>
                        <div className="cover-title-block">
                          <strong>{post.coverTitle || post.title}</strong>
                          {subtitleKey ? <span className="cover-subtitle">{t(subtitleKey)}</span> : null}
                        </div>
                        <small>{t('coverBrand')}</small>
                      </div>
                    </div>
                    <div className="blog-card-body">
                      <div className="article-meta">
                        <span>{post.category}</span>
                        <time dateTime={post.date}>{formatBlogDate(post.date)}</time>
                      </div>
                      <h2>{post.title}</h2>
                      <p>{post.desc}</p>
                      <span className="read-more">
                        {t('readMore')}
                        <span>{t('arrow')}</span>
                      </span>
                    </div>
                  </Link>
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
