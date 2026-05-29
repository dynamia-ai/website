import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import AttachmentDocClient from '@/components/attachments/AttachmentDocClient';
import { getAttachmentDoc, getAttachmentSlugs } from '@/lib/attachments';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return getAttachmentSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const docLocale = locale === 'zh' ? 'zh' : 'en';
  const doc = await getAttachmentDoc(slug, docLocale);
  const t = await getTranslations({ locale, namespace: 'attachments' });

  if (!doc) return { title: t('notFound'), robots: { index: false, follow: false } };

  return {
    title: doc.frontmatter.title,
    description: doc.frontmatter.description,
    robots: { index: false, follow: false },
    alternates: { canonical: `/${locale === routing.defaultLocale ? '' : locale + '/'}attachments/${slug}` },
  };
}

export default async function AttachmentPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const docLocale = locale === 'zh' ? 'zh' : 'en';
  const doc = await getAttachmentDoc(slug, docLocale);
  if (!doc) notFound();

  return (
    <AttachmentDocClient
      title={doc.frontmatter.title}
      description={doc.frontmatter.description}
      lastUpdated={doc.frontmatter.lastUpdated}
      html={doc.html}
      toc={doc.toc}
      locale={docLocale}
    />
  );
}
