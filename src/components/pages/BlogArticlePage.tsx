import {notFound} from 'next/navigation';
import {getLocale, getTranslations} from 'next-intl/server';
import Link from 'next/link';
import ArticleCopyLink from '@/components/layout/ArticleCopyLink';
import BlogCard from '@/components/layout/BlogCard';
import SiteArrow from '@/components/layout/SiteArrow';
import {getBlogPost, getAllBlogPosts, getBlogCatalog, markdownToHtml} from '@/lib/blog-server';
import {
  CATEGORY_LABEL_KEYS,
  CATEGORY_SUBTITLE_KEYS,
  formatBlogDate,
  resolveBlogCategoryId,
} from '@/lib/site/blogData';
import {localizeContentHtml, websitePath} from '@/lib/site/links';
import {contentLocaleCandidates} from '@/lib/site/localeFallback';
import {localizedPath, localizedUrl} from '@/utils/i18n';
import type {BlogPost} from '@/types/blog';
import '@/styles/article.css';
import '@/styles/blog.css';

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
  const home = await getTranslations({locale, namespace: 'sitePages.home'});
  const dynamiaLogo = home('brand.logo');
  const post = resolvePost(slug, locale);
  if (!post) notFound();

  const figureLabel = tUi('figureLabel');
  const rendered = await markdownToHtml(post.content, figureLabel);
  const html = localizeContentHtml(rendered.html, locale);
  const toc = rendered.toc;
  const categoryId = resolveBlogCategoryId(post.categoryId, post.category);
  const category = t(CATEGORY_LABEL_KEYS[categoryId]);
  const coverTitle = post.coverTitle || post.linktitle || post.title;
  const subtitleKey = CATEGORY_SUBTITLE_KEYS[categoryId];
  const coverSubtitle = subtitleKey ? t(subtitleKey) : '';
  const related = getBlogCatalog(locale)
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
                    <img className="cover-mark" src={dynamiaLogo} alt={t('coverMarkAlt')} />
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
                  <details className="article-mobile-toc">
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
                <SiteArrow variant="text" />
              </Link>
            </div>
            <div className="grid3">
              {related.map((item) => {
                const relatedSubtitleKey = CATEGORY_SUBTITLE_KEYS[item.categoryId];
                const relatedCategory = t(CATEGORY_LABEL_KEYS[item.categoryId]);
                return (
                  <BlogCard
                    key={item.slug}
                    href={localizedPath(websitePath(`/blog/${item.slug}`), locale)}
                    title={item.title}
                    desc={item.desc}
                    category={relatedCategory}
                    categoryId={item.categoryId}
                    date={item.date}
                    coverTitle={item.coverTitle}
                    coverSubtitle={relatedSubtitleKey ? t(relatedSubtitleKey) : undefined}
                    coverBrand={t('coverBrand')}
                    coverMarkAlt={t('coverMarkAlt')}
                    readMore={t('readMore')}
                    logoSrc={dynamiaLogo}
                  />
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
