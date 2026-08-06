import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import InstallDocClient from '@/components/enterprise/InstallDocClient';
import { getInstallDoc, getInstallDocLocales, getInstallDocSlugs } from '@/lib/enterprise-docs';
import { localizedAlternates, localizedUrl } from '@/utils/i18n';
import { routing } from '@/i18n/routing';

interface PageProps {
  params: Promise<{ locale: string; productId: string }>;
}

export function generateStaticParams() {
  return getInstallDocSlugs().map((productId) => ({ productId }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, productId } = await params;
  const docLocale = locale === 'zh' ? 'zh' : 'en';
  const doc = await getInstallDoc(productId, docLocale);
  if (!doc) return { title: 'Install Guide Not Found' };
  const availableLocales = getInstallDocLocales(productId);
  const canonicalLocale = availableLocales.includes(locale)
    ? locale
    : availableLocales.includes(routing.defaultLocale)
      ? routing.defaultLocale
      : availableLocales[0];
  const path = `/products/${productId}/install`;

  const title = `${doc.frontmatter.title} | Dynamia AI`;

  return {
    title: { absolute: title },
    description: doc.frontmatter.description,
    robots: availableLocales.includes(locale)
      ? undefined
      : { index: false, follow: true },
    alternates: canonicalLocale
      ? {
          canonical: localizedUrl(path, canonicalLocale),
          languages: localizedAlternates(path, availableLocales),
        }
      : undefined,
  };
}

export default async function InstallDocPage({ params }: PageProps) {
  const { locale, productId } = await params;
  setRequestLocale(locale);
  const docLocale = locale === 'zh' ? 'zh' : 'en';
  const doc = await getInstallDoc(productId, docLocale);
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
    />
  );
}
