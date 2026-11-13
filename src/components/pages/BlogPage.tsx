import {getLocale, getTranslations} from 'next-intl/server';
import Link from 'next/link';
import {websitePath} from '@/lib/site/links';
import {localizedPath} from '@/utils/i18n';
import BlogListing from '@/components/pages/BlogListing';

export default async function BlogPage() {
  const t = await getTranslations('sitePages.blog');
  const locale = await getLocale();

  return (
    <>
      <section className="editorial-hero">
        <div className="wrap">
          <div className="breadcrumb">
            <Link href={localizedPath(websitePath('/'), locale)}>{t('breadcrumbHome')}</Link>
            <span>{t('breadcrumbSep')}</span>
            <span>{t('title')}</span>
          </div>
          <div className="blog-head">
            <div>
              <h1>{t('title')}</h1>
              <p>{t('intro')}</p>
            </div>
          </div>
        </div>
      </section>
      <BlogListing />
    </>
  );
}
