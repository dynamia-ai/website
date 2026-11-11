import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {localizedUrl, pageAlternates} from '@/utils/i18n';
import {websitePath} from '@/lib/site/links';
import {contentLocaleCandidates} from '@/lib/site/localeFallback';
import manifestData from '@/content/site/manifest.json';
import {getBlogPost} from '@/lib/blog-server';
import {getCaseDocument} from '@/lib/site/caseContent';
import {videos} from '@/data/videos';
import {SITE_URL} from '@/config/app-config';

interface Entry {
  name: string;
  title: string;
  articleId?: number;
}

type SeoPage =
  | 'home'
  | 'products'
  | 'pricing'
  | 'company'
  | 'blog'
  | 'caseStudies'
  | 'tools'
  | 'solutions'
  | 'resources'
  | 'whatIsHami'
  | 'faq';

const manifest = manifestData as Record<string, Entry>;

const SEO_BY_ROUTE: Record<string, SeoPage> = {
  '/': 'home',
  '/products': 'products',
  '/pricing': 'pricing',
  '/about': 'company',
  '/blog': 'blog',
  '/cases': 'caseStudies',
  '/tools': 'tools',
  '/solutions': 'solutions',
  '/resources': 'resources',
  '/faq': 'faq',
  '/community': 'whatIsHami',
  '/what-is-hami': 'whatIsHami',
  '/opensource': 'whatIsHami',
};

function buildPageMetadata(input: {
  title: string;
  description: string;
  keywords?: string;
  path: string;
  locale: string;
  siteName: string;
  ogLocale: string;
}): Metadata {
  const {title, description, keywords, path, locale, siteName, ogLocale} = input;
  const image = {
    url: `${SITE_URL}/LOGO-small.svg`,
    width: 1200,
    height: 630,
    alt: title,
  };

  return {
    title: {absolute: title},
    description,
    ...(keywords ? {keywords} : {}),
    openGraph: {
      title,
      description,
      url: localizedUrl(path, locale),
      siteName,
      type: 'website',
      locale: ogLocale,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image.url],
    },
    alternates: pageAlternates(path, locale),
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export async function siteMetadata(route: string, locale: string): Promise<Metadata> {
  const publicPath = websitePath(route);
  const seoPage = SEO_BY_ROUTE[route];
  const mt = await getTranslations({locale, namespace: 'Metadata'});
  const siteName = mt('siteName');
  const ogLocale = mt('ogLocale');

  if (seoPage) {
    const t = await getTranslations({locale, namespace: 'Seo'});
    return buildPageMetadata({
      title: t(`${seoPage}.title`),
      description: t(`${seoPage}.description`),
      keywords: t(`${seoPage}.keywords`),
      path: publicPath,
      locale,
      siteName,
      ogLocale,
    });
  }

  const title = manifest[route]?.title || mt('title');
  return buildPageMetadata({
    title,
    description: mt('description'),
    keywords: mt('keywords'),
    path: publicPath,
    locale,
    siteName,
    ogLocale,
  });
}

function resolveBlogTitle(slug: string, locale: string): string | null {
  for (const lang of contentLocaleCandidates(locale)) {
    const post = getBlogPost(slug, lang);
    if (post?.title) return post.title;
  }
  return null;
}

export async function siteBlogMetadata(slug: string, locale: string): Promise<Metadata> {
  const title = resolveBlogTitle(slug, locale);
  const mt = await getTranslations({locale, namespace: 'Metadata'});
  if (!title) {
    const t = await getTranslations({locale, namespace: 'blogUI'});
    return {title: t('notFound')};
  }
  return buildPageMetadata({
    title,
    description: mt('description'),
    path: websitePath(`/blog/${slug}`),
    locale,
    siteName: mt('siteName'),
    ogLocale: mt('ogLocale'),
  });
}

export async function siteCaseMetadata(slug: string, locale: string): Promise<Metadata> {
  const doc = getCaseDocument(slug, locale);
  const mt = await getTranslations({locale, namespace: 'Metadata'});
  if (!doc) {
    const t = await getTranslations({locale, namespace: 'blogUI'});
    return {title: t('notFound')};
  }
  return buildPageMetadata({
    title: doc.title,
    description: mt('description'),
    path: websitePath(`/case-studies/${slug}`),
    locale,
    siteName: mt('siteName'),
    ogLocale: mt('ogLocale'),
  });
}

export async function siteVideoMetadata(videoId: string, locale: string): Promise<Metadata> {
  const video = videos.find((item) => item.id === videoId);
  const mt = await getTranslations({locale, namespace: 'Metadata'});
  if (!video) {
    const t = await getTranslations({locale, namespace: 'blogUI'});
    return {title: t('notFound')};
  }
  const tVideos = await getTranslations({locale, namespace: 'videos'});
  return buildPageMetadata({
    title: tVideos(video.titleKey),
    description: mt('description'),
    path: websitePath(`/videos/${videoId}`),
    locale,
    siteName: mt('siteName'),
    ogLocale: mt('ogLocale'),
  });
}
