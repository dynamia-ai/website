import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import InstallDocClient from '@/components/enterprise/InstallDocClient';
import { getInstallDoc, getInstallDocSlugs } from '@/lib/enterprise-docs';

interface PageProps {
  params: Promise<{ productId: string }>;
}

export function generateStaticParams() {
  return getInstallDocSlugs().map((productId) => ({ productId }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { productId } = await params;
  const doc = await getInstallDoc(productId, 'zh');
  if (!doc) return { title: '安装指南未找到' };

  return {
    title: `${doc.frontmatter.title} | 密瓜智能`,
    description: doc.frontmatter.description,
  };
}

export default async function ZhInstallDocPage({ params }: PageProps) {
  const { productId } = await params;
  const doc = await getInstallDoc(productId, 'zh');
  if (!doc) notFound();

  return (
    <InstallDocClient
      productId={productId}
      title={doc.frontmatter.title}
      version={doc.frontmatter.version}
      lastUpdated={doc.frontmatter.lastUpdated}
      description={doc.frontmatter.description}
      html={doc.html}
      toc={doc.toc}
      locale="zh"
    />
  );
}
