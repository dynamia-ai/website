import '@/styles/site.css';
import type {ReactNode} from 'react';
import {getLocale} from 'next-intl/server';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import PageEffects from '@/components/layout/PageEffects';
import ThemeSync from '@/components/layout/ThemeSync';
import BackToTop from '@/components/layout/BackToTop';
import ArticleImageViewer from '@/components/layout/ArticleImageViewer';

interface MainLayoutProps {
  children: ReactNode;
}

export default async function MainLayout({children}: MainLayoutProps) {
  const locale = await getLocale();

  return (
    <div className="site-root" data-locale={locale}>
      <ThemeSync />
      <Header />
      <main id="app" className="native-content">
        {children}
      </main>
      <PageEffects />
      <Footer />
      <BackToTop />
      <ArticleImageViewer />
    </div>
  );
}
