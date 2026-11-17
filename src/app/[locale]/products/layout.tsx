import {setRequestLocale} from 'next-intl/server';
import {productSchema, JsonLd} from '@/components/StructuredData';

export default async function ProductsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return (
    <>
      <JsonLd data={productSchema()} />
      {children}
    </>
  );
}
