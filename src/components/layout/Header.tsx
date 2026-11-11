'use client';

import {useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import {useLocale, useTranslations} from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import {websitePath} from '@/lib/site/links';
import {localizedPath} from '@/utils/i18n';

type MenuId = 'products' | 'resources' | 'company';

function NavChevron() {
  return (
    <svg
      className="nav-chevron"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 11.2 19a19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.2 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.2 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.5 1.9Z" />
    </svg>
  );
}

export default function Header() {
  const locale = useLocale();
  const t = useTranslations('siteShell');
  const nav = useTranslations('navigation');
  const headerRef = useRef<HTMLElement>(null);
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [progress, setProgress] = useState(0);

  function href(route: string) {
    return localizedPath(websitePath(route), locale);
  }

  function toggleMenu(id: MenuId) {
    setOpenMenu((current) => (current === id ? null : id));
    setMobileOpen(false);
  }

  function closeMenus() {
    setOpenMenu(null);
    setMobileOpen(false);
  }

  useEffect(() => {
    const dark = document.documentElement.dataset.theme === 'dark';
    setTheme(dark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    const updateProgress = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, {passive: true});
    window.addEventListener('resize', updateProgress);
    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!headerRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeMenus();
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    document.documentElement.classList.toggle('dark', next === 'dark');
    try {
      localStorage.setItem('dynamia-demo-theme', next);
    } catch {
      // ignore storage failures
    }
    setTheme(next);
  }

  const showCareers = Boolean(t.raw('showCareers'));

  return (
    <header ref={headerRef}>
      <div className="header-inner">
        <Link className="brand" href={href('/')} aria-label={t('brandHome')}>
          <img className="brand-light" src={nav('logo')} alt={t('brandAlt')} />
          <img className="brand-dark" src={nav('logoDark')} alt={t('brandAlt')} />
        </Link>

        <nav className="desktop-nav" aria-label={t('navAria')}>
          <div className="navitem">
            <button
              className="navtrigger"
              type="button"
              aria-expanded={openMenu === 'products'}
              aria-controls="menu-products"
              onClick={() => toggleMenu('products')}
            >
              {t('nav.products')}
              <NavChevron />
            </button>
          </div>
          <Link className="navlink" href={href('/pricing')} onClick={closeMenus}>
            {t('nav.pricing')}
          </Link>
          <Link className="navlink" href={href('/cases')} onClick={closeMenus}>
            {t('nav.cases')}
          </Link>
          <div className="navitem">
            <button
              className="navtrigger"
              type="button"
              aria-expanded={openMenu === 'resources'}
              aria-controls="menu-resources"
              onClick={() => toggleMenu('resources')}
            >
              {t('nav.resources')}
              <NavChevron />
            </button>
          </div>
          <Link className="navlink" href={href('/community')} onClick={closeMenus}>
            {t('nav.community')}
          </Link>
          <div className="navitem">
            <button
              className="navtrigger"
              type="button"
              aria-expanded={openMenu === 'company'}
              aria-controls="menu-company"
              onClick={() => toggleMenu('company')}
            >
              {t('nav.company')}
              <NavChevron />
            </button>
          </div>
        </nav>

        <div className="header-actions">
          <a className="tel" href="tel:4000267800">
            <PhoneIcon />
            {t('tel')}
          </a>
          <Link className="btn primary small" href={href('/contact-sales')}>
            {t('bookDemo')}
          </Link>
          <button
            className="theme-toggle"
            type="button"
            aria-label={theme === 'dark' ? t('themeToLight') : t('themeToDark')}
            aria-pressed={theme === 'dark'}
            onClick={toggleTheme}
          >
            <svg className="theme-moon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />
            </svg>
            <svg className="theme-sun" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5" />
            </svg>
          </button>
          <div id="redesign-language-switcher">
            <LanguageSwitcher />
          </div>
          <button
            className="menu-toggle"
            type="button"
            aria-label={mobileOpen ? t('closeNav') : t('openNav')}
            aria-expanded={mobileOpen}
            onClick={() => {
              setMobileOpen((open) => !open);
              setOpenMenu(null);
            }}
          >
            {t('menuIcon')}
          </button>
        </div>
      </div>

      <div className={`mega${openMenu === 'products' ? ' open' : ''}`} id="menu-products">
        <div className="mega-inner nav-card-menu products-card-menu">
          <Link href={href('/products')} onClick={closeMenus}>
            <span className="menu-kicker">{t('mega.products.overview.kicker')}</span>
            <strong>
              {t('mega.products.overview.title')} <b>↗</b>
            </strong>
            <span>{t('mega.products.overview.desc')}</span>
          </Link>
          <Link href={href('/enterprise')} onClick={closeMenus}>
            <span className="menu-kicker">{t('mega.products.enterprise.kicker')}</span>
            <strong>
              {t('mega.products.enterprise.title')} <b>↗</b>
            </strong>
            <span>{t('mega.products.enterprise.desc')}</span>
          </Link>
          <Link href={href('/platform')} onClick={closeMenus}>
            <span className="menu-kicker">{t('mega.products.platform.kicker')}</span>
            <strong>
              {t('mega.products.platform.title')} <b>↗</b>
            </strong>
            <span>{t('mega.products.platform.desc')}</span>
          </Link>
          <a href="https://docs.dynamia.ai" target="_blank" rel="noopener noreferrer" onClick={closeMenus}>
            <span className="menu-kicker">{t('mega.products.docs.kicker')}</span>
            <strong>
              {t('mega.products.docs.title')} <b>↗</b>
            </strong>
            <span>{t('mega.products.docs.desc')}</span>
          </a>
        </div>
      </div>

      <div className={`mega${openMenu === 'resources' ? ' open' : ''}`} id="menu-resources">
        <div className="mega-inner nav-card-menu">
          <Link href={href('/blog')} onClick={closeMenus}>
            <span className="menu-kicker">{t('mega.resources.blog.kicker')}</span>
            <strong>
              {t('mega.resources.blog.title')} <b>↗</b>
            </strong>
            <span>{t('mega.resources.blog.desc')}</span>
          </Link>
          <Link href={href('/videos')} onClick={closeMenus}>
            <span className="menu-kicker">{t('mega.resources.videos.kicker')}</span>
            <strong>
              {t('mega.resources.videos.title')} <b>↗</b>
            </strong>
            <span>{t('mega.resources.videos.desc')}</span>
          </Link>
          <Link href={href('/tools')} onClick={closeMenus}>
            <span className="menu-kicker">{t('mega.resources.tools.kicker')}</span>
            <strong>
              {t('mega.resources.tools.title')} <b>↗</b>
            </strong>
            <span>{t('mega.resources.tools.desc')}</span>
          </Link>
        </div>
      </div>

      <div className={`mega${openMenu === 'company' ? ' open' : ''}`} id="menu-company">
        <div className="mega-inner nav-card-menu">
          <Link href={href('/about')} onClick={closeMenus}>
            <span className="menu-kicker">{t('mega.company.about.kicker')}</span>
            <strong>
              {t('mega.company.about.title')} <b>↗</b>
            </strong>
            <span>{t('mega.company.about.desc')}</span>
          </Link>
          {showCareers ? (
            <Link href={href('/careers')} onClick={closeMenus}>
              <span className="menu-kicker">{t('mega.company.careers.kicker')}</span>
              <strong>
                {t('mega.company.careers.title')} <b>↗</b>
              </strong>
              <span>{t('mega.company.careers.desc')}</span>
            </Link>
          ) : null}
          <Link href={href('/events')} onClick={closeMenus}>
            <span className="menu-kicker">{t('mega.company.events.kicker')}</span>
            <strong>
              {t('mega.company.events.title')} <b>↗</b>
            </strong>
            <span>{t('mega.company.events.desc')}</span>
          </Link>
        </div>
      </div>

      <nav className={`mobile-nav${mobileOpen ? ' open' : ''}`} aria-label={t('mobile.aria')}>
        <div className="mobile-company">
          <span>{t('nav.products')}</span>
          <Link href={href('/products')} onClick={closeMenus}>
            {t('mobile.productsOverview')}
          </Link>
          <Link href={href('/enterprise')} onClick={closeMenus}>
            {t('mobile.enterprise')}
          </Link>
          <Link href={href('/platform')} onClick={closeMenus}>
            {t('mobile.platform')}
          </Link>
          <a href="https://docs.dynamia.ai" target="_blank" rel="noopener noreferrer" onClick={closeMenus}>
            {t('mobile.docs')}
          </a>
        </div>
        <Link href={href('/pricing')} onClick={closeMenus}>
          {t('mobile.pricing')}
        </Link>
        <Link href={href('/cases')} onClick={closeMenus}>
          {t('mobile.cases')}
        </Link>
        <Link href={href('/community')} onClick={closeMenus}>
          {t('mobile.community')}
        </Link>
        <div className="mobile-company">
          <span>{t('nav.resources')}</span>
          <Link href={href('/blog')} onClick={closeMenus}>
            {t('mobile.blog')}
          </Link>
          <Link href={href('/videos')} onClick={closeMenus}>
            {t('mobile.videos')}
          </Link>
          <Link href={href('/tools')} onClick={closeMenus}>
            {t('mobile.tools')}
          </Link>
        </div>
        <div className="mobile-company">
          <span>{t('nav.company')}</span>
          <Link href={href('/about')} onClick={closeMenus}>
            {t('mobile.about')}
          </Link>
          {showCareers ? (
            <Link href={href('/careers')} onClick={closeMenus}>
              {t('mobile.careers')}
            </Link>
          ) : null}
          <Link href={href('/events')} onClick={closeMenus}>
            {t('mobile.events')}
          </Link>
        </div>
      </nav>
      <div className="progress" style={{width: `${progress}%`}} />
    </header>
  );
}
