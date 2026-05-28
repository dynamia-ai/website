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
  const doc = await getAttachmentDoc(slug, 'en');
  if (!doc) return { title: 'Attachment Not Found', robots: { index: false, follow: false } };

  return {
    title: `${doc.frontmatter.title} | Dynamia AI`,
    description: doc.frontmatter.description,
    robots: { index: false, follow: false },
    alternates: { canonical: `/attachments/${slug}` },
  };
}

export default async function AttachmentPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = await getAttachmentDoc(slug, 'en');
  if (!doc) notFound();

  return (
    <AttachmentDocClient
      title={doc.frontmatter.title}
      description={doc.frontmatter.description}
      lastUpdated={doc.frontmatter.lastUpdated}
      html={doc.html}
      toc={doc.toc}
      locale="en"
    />
  );
}
