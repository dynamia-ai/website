import {notFound} from 'next/navigation';
import {getLocale, getTranslations} from 'next-intl/server';
import Link from 'next/link';
import ArticleCopyLink from '@/components/layout/ArticleCopyLink';
import {getBlogPost, getAllBlogPosts, markdownToHtml} from '@/lib/blog-server';
import {
  CATEGORY_SUBTITLE_KEYS,
  formatBlogDate,
  localizedBlogPosts,
} from '@/lib/site/blogData';
import {localizeContentHtml, websitePath} from '@/lib/site/links';
import {contentLocaleCandidates} from '@/lib/site/localeFallback';
import {localizedPath, localizedUrl} from '@/utils/i18n';
import type {BlogPost} from '@/types/blog';

interface BlogArticlePageProps {
  slug: string;
}

function resolvePost(slug: string, locale: string): BlogPost | null {
  for (const lang of contentLocaleCandidates(locale)) {
    const post = getBlogPost(slug, lang);
    if (post) return post;
  }
  return null;
}

export async function BlogArticlePage({slug}: BlogArticlePageProps) {
  const locale = await getLocale();
  const t = await getTranslations({locale, namespace: 'sitePages.blog'});
  const tUi = await getTranslations({locale, namespace: 'blogUI'});
  const post = resolvePost(slug, locale);
  if (!post) notFound();

  const figureLabel = tUi('figureLabel');
  const rendered = await markdownToHtml(post.content, figureLabel);
  const html = localizeContentHtml(rendered.html, locale);
  const toc = rendered.toc;
  const editorial = localizedBlogPosts(locale).find((item) => item.slug === slug);
  const category = editorial?.category || post.category || '';
  const categoryId = editorial?.categoryId || category;
  const coverTitle = editorial?.coverTitle || post.coverTitle || post.linktitle || post.title;
  const subtitleKey = CATEGORY_SUBTITLE_KEYS[categoryId];
  const coverSubtitle = subtitleKey ? t(subtitleKey) : '';
  const related = localizedBlogPosts(locale)
    .filter((item) => item.slug !== slug)
    .slice(0, 3);
  const shareUrl = localizedUrl(websitePath(`/blog/${slug}`), locale);
  const authorInitial = (post.author || 'D').trim().charAt(0).toUpperCase();

  return (
    <>
      <article className="blog-detail">
        <div className="article-hero">
          <div className="article-shell">
            <nav className="breadcrumb" aria-label={t('breadcrumbHome')}>
              <Link href={localizedPath(websitePath('/'), locale)}>{t('breadcrumbHome')}</Link>
              <span>{t('breadcrumbSep')}</span>
              <Link href={localizedPath(websitePath('/blog'), locale)}>{t('title')}</Link>
              <span>{t('breadcrumbSep')}</span>
              <span>{category}</span>
            </nav>

            <div className="article-kicker">
              {category ? <span className="tag">{category}</span> : null}
              {post.date ? <time dateTime={post.date}>{formatBlogDate(post.date)}</time> : null}
            </div>

            <h1>{post.title}</h1>

            <div className="article-author-row">
              <div className="blog-card-author">
                <span className="author-initial" aria-hidden="true">
                  {authorInitial}
                </span>
                <div className="blog-author-info">
                  <span className="blog-author-name">{post.author || 'Dynamia'}</span>
                  <span className="blog-author-title">{t('detail.authorLabel')}</span>
                </div>
              </div>
              <ArticleCopyLink url={shareUrl} />
            </div>

            <div className="article-cover">
              <div className="content-cover editorial-cover" data-category={categoryId}>
                <div className="text-cover">
                  <div className="cover-topline">
                    <img
                      className="cover-mark"
                      src="/redesign/assets/cf10a2fcc13438169897.svg"
                      alt={t('coverMarkAlt')}
                    />
                    {category ? <span className="cover-category">{category}</span> : null}
                  </div>
                  <div className="cover-title-block">
                    <strong>{coverTitle}</strong>
                    {coverSubtitle ? <span className="cover-subtitle">{coverSubtitle}</span> : null}
                  </div>
                  <small>{t('coverBrand')}</small>
                </div>
              </div>
            </div>

            {post.excerpt ? <p className="article-deck">{post.excerpt}</p> : null}
          </div>
        </div>

        <div className="article-reading">
          <div className="article-shell">
            <div className="article-reading-grid">
              <div>
                {toc.length ? (
                  <details className="case-mobile-toc">
                    <summary>{t('detail.onThisPage')}</summary>
                    <nav>
                      {toc.map((item) => (
                        <a key={item.id} href={`#${item.id}`} data-level={`h${item.level}`}>
                          {item.text}
                        </a>
                      ))}
                    </nav>
                  </details>
                ) : null}
                <div className="article-prose" dangerouslySetInnerHTML={{__html: html}} />
              </div>
              {toc.length ? (
                <aside className="article-toc" aria-label={t('detail.onThisPage')}>
                  <strong>{t('detail.onThisPage')}</strong>
                  {toc.map((item) => (
                    <a key={item.id} href={`#${item.id}`} data-level={`h${item.level}`}>
                      {item.text}
                    </a>
                  ))}
                </aside>
              ) : null}
            </div>
          </div>
        </div>
      </article>

      {related.length ? (
        <section className="article-related">
          <div className="wrap">
            <div className="intro">
              <div>
                <div className="eyebrow">{t('detail.keepReadingEyebrow')}</div>
                <h2>{t('detail.keepReading')}</h2>
              </div>
              <Link className="textlink" href={localizedPath(websitePath('/blog'), locale)}>
                {t('detail.allArticles')}
                <span className="arrow">{t('arrow')}</span>
              </Link>
            </div>
            <div className="grid3">
              {related.map((item) => {
                const relatedSubtitleKey = CATEGORY_SUBTITLE_KEYS[item.categoryId];
                return (
                  <Link
                    key={item.id}
                    className="blog-card"
                    href={localizedPath(websitePath(`/blog/${item.slug}`), locale)}
                  >
                    <div className="content-cover editorial-cover" data-category={item.categoryId}>
                      <div className="text-cover">
                        <div className="cover-topline">
                          <img
                            className="cover-mark"
                            src="/redesign/assets/cf10a2fcc13438169897.svg"
                            alt={t('coverMarkAlt')}
                          />
                          <span className="cover-category">{item.category}</span>
                        </div>
                        <div className="cover-title-block">
                          <strong>{item.coverTitle || item.title}</strong>
                          {relatedSubtitleKey ? (
                            <span className="cover-subtitle">{t(relatedSubtitleKey)}</span>
                          ) : null}
                        </div>
                        <small>{t('coverBrand')}</small>
                      </div>
                    </div>
                    <div className="blog-card-body">
                      <div className="article-meta">
                        <span>{item.category}</span>
                        <time dateTime={item.date}>{formatBlogDate(item.date)}</time>
                      </div>
                      <h2>{item.title}</h2>
                      <p>{item.desc}</p>
                      <span className="read-more">
                        {t('readMore')}
                        <span>{t('arrow')}</span>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

export function blogArticleExists(slug: string, locale: string): boolean {
  return Boolean(resolvePost(slug, locale));
}

export function blogArticleSlugs(): string[] {
  return getAllBlogPosts('zh').posts.map((post) => post.slug);
}
