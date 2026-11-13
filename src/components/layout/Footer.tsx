import Link from 'next/link';
import {getLocale, getTranslations} from 'next-intl/server';
import {websitePath} from '@/lib/site/links';
import {localizedPath} from '@/utils/i18n';

export default async function Footer() {
  const locale = await getLocale();
  const t = await getTranslations('siteShell');
  const showCareers = Boolean(t.raw('showCareers'));

  function href(route: string) {
    return localizedPath(websitePath(route), locale);
  }

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="site-footer-grid">
          <div className="site-footer-brand">
            <Link href={href('/community')} aria-label={t('footer.creatorsAria')}>
              <img
                className="creators-mark"
                src="/redesign/assets/51b48ae8e0a78b280a50.svg"
                alt={t('footer.creatorsAlt')}
              />
            </Link>
            <p>
              {t('footer.taglineLead')}
              <br />
              {t('footer.taglineTrail')}
            </p>
            <span className="footer-qr-label">{t('footer.qrLabel')}</span>
            <img
              className="footer-qr"
              src="/redesign/assets/a9fadb5062623ccf2372.jpg"
              alt={t('footer.qrAlt')}
              loading="lazy"
            />
          </div>

          <div className="site-footer-links">
            <h3>{t('nav.products')}</h3>
            <Link href={href('/products')}>{t('footer.productsOverview')}</Link>
            <Link href={href('/enterprise')}>{t('mobile.enterprise')}</Link>
            <Link href={href('/platform')}>{t('mobile.platform')}</Link>
            <Link href={href('/pricing')}>{t('nav.pricing')}</Link>
            <Link href={href('/contact-sales')}>{t('footer.bookDemo')}</Link>
          </div>

          <div className="site-footer-links">
            <h3>{t('nav.resources')}</h3>
            <Link href={href('/blog')}>{t('mobile.blog')}</Link>
            <Link href={href('/videos')}>{t('mobile.videos')}</Link>
            <Link href={href('/tools')}>{t('mobile.tools')}</Link>
            <a href="https://docs.dynamia.ai" target="_blank" rel="noopener noreferrer">
              {t('mobile.docs')}
            </a>
          </div>

          <div className="site-footer-links">
            <h3>{t('footer.companyCommunity')}</h3>
            <Link href={href('/about')}>{t('mobile.about')}</Link>
            <Link href={href('/cases')}>{t('nav.cases')}</Link>
            {showCareers ? <Link href={href('/careers')}>{t('mobile.careers')}</Link> : null}
            <Link href={href('/events')}>{t('mobile.events')}</Link>
            <Link href={href('/community')}>{t('footer.aboutHami')}</Link>
          </div>

          <div className="site-footer-links">
            <h3>{t('footer.contact')}</h3>
            <span className="contact-caption">{t('footer.emailLabel')}</span>
            <a href="mailto:info@dynamia.ai">{t('footer.email')}</a>
            <span className="contact-caption" style={{marginTop: 12}}>
              {t('footer.phoneLabel')}
            </span>
            <a href="tel:4000267800">{t('tel')}</a>
            <span className="contact-caption" style={{marginTop: 12}}>
              {t('footer.follow')}
            </span>
            <div className="footer-media">
              <a
                href="https://www.linkedin.com/company/dynamia-ai/"
                target="_blank"
                rel="noopener"
                aria-label={t('footer.linkedin')}
                title={t('footer.linkedin')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" aria-hidden="true">
                  <path d="M416 32L31.9 32C14.3 32 0 46.5 0 64.3L0 447.7C0 465.5 14.3 480 31.9 480L416 480c17.6 0 32-14.5 32-32.3l0-383.4C448 46.5 433.6 32 416 32zM135.4 416l-66.4 0 0-213.8 66.5 0 0 213.8-.1 0zM102.2 96a38.5 38.5 0 1 1 0 77 38.5 38.5 0 1 1 0-77zM384.3 416l-66.4 0 0-104c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9l0 105.8-66.4 0 0-213.8 63.7 0 0 29.2 .9 0c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9l0 117.2z" />
                </svg>
              </a>
              <a
                href="https://x.com/dynamia_ai"
                target="_blank"
                rel="noopener"
                aria-label={t('footer.x')}
                title={t('footer.x')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" aria-hidden="true">
                  <path d="M357.2 48L427.8 48 273.6 224.2 455 464 313 464 201.7 318.6 74.5 464 3.8 464 168.7 275.5-5.2 48 140.4 48 240.9 180.9 357.2 48zM332.4 421.8l39.1 0-252.4-333.8-42 0 255.3 333.8z" />
                </svg>
              </a>
              <a
                href="https://www.zhihu.com/org/shang-hai-mi-gua-zhi-neng-ke-ji-you-xian-gong-si"
                target="_blank"
                rel="noopener"
              >
                {t('footer.zhihu')}
              </a>
            </div>
          </div>

          <div className="footer-certifications">
            <a href="https://www.cncf.io/projects/hami/" target="_blank" rel="noopener" aria-label={t('footer.cncfAria')}>
              <img
                className="footer-certification-mark"
                src="/redesign/assets/cncf-mark.svg"
                alt={t('footer.cncfAria')}
              />
              <small>{t('footer.cncfCaption')}</small>
            </a>
            <a
              href="https://landscape.cncf.io/?selected=hami&group=cnai&item=orchestration-management--scheduling-orchestration--hami"
              target="_blank"
              rel="noopener"
              aria-label={t('footer.landscapeAria')}
            >
              <img
                className="footer-certification-mark"
                src="/redesign/assets/cncf-landscape-mark.svg"
                alt={t('footer.landscapeAria')}
              />
              <small>{t('footer.landscapeCaption')}</small>
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>{t('footer.copyright')}</span>
          {t('footer.demoNote') ? <span>{t('footer.demoNote')}</span> : null}
        </div>
      </div>
    </footer>
  );
}
