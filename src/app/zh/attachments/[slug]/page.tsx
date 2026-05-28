import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AttachmentDocClient from '@/components/attachments/AttachmentDocClient';
import { getAttachmentDoc, getAttachmentSlugs } from '@/lib/attachments';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAttachmentSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getAttachmentDoc(slug, 'zh');
  if (!doc) return { title: '附件未找到', robots: { index: false, follow: false } };

  return {
    title: `${doc.frontmatter.title} | 密瓜智能`,
    description: doc.frontmatter.description,
    robots: { index: false, follow: false },
    alternates: { canonical: `/zh/attachments/${slug}` },
  };
}

export default async function ZhAttachmentPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = await getAttachmentDoc(slug, 'zh');
  if (!doc) notFound();

  return (
    <AttachmentDocClient
      title={doc.frontmatter.title}
      description={doc.frontmatter.description}
      lastUpdated={doc.frontmatter.lastUpdated}
      html={doc.html}
      toc={doc.toc}
      locale="zh"
    />
  );
}
