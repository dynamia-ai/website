import { NextResponse } from 'next/server';
import { getInstallDoc } from '@/lib/enterprise-docs';

interface RouteParams {
  params: Promise<{ productId: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  const { productId } = await params;
  const url = new URL(req.url);
  const localeParam = url.searchParams.get('locale');
  const locale: 'en' | 'zh' = localeParam === 'en' ? 'en' : 'zh';
  const doc = await getInstallDoc(productId, locale);
  if (!doc) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

  return NextResponse.json({
    productId,
    title: doc.frontmatter.title,
    version: doc.frontmatter.version,
    lastUpdated: doc.frontmatter.lastUpdated,
    description: doc.frontmatter.description,
    html: doc.html,
    toc: doc.toc,
  });
}
