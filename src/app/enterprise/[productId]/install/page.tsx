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
  const doc = await getInstallDoc(productId, 'en');
  if (!doc) return { title: 'Install Guide Not Found' };

  return {
    title: `${doc.frontmatter.title} | Dynamia AI`,
    description: doc.frontmatter.description,
  };
}

export default async function InstallDocPage({ params }: PageProps) {
  const { productId } = await params;
  const doc = await getInstallDoc(productId, 'en');
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
      locale="en"
    />
  );
}
