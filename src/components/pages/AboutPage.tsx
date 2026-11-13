import {getLocale, getTranslations} from 'next-intl/server';
import {localizedPath} from '@/utils/i18n';
import {websitePath} from '@/lib/site/links';
import AboutTeamSection from '@/components/pages/AboutTeamSection';
import AboutWeChatCard from '@/components/pages/AboutWeChatCard';

export default async function AboutPage() {
  const t = await getTranslations('sitePages.about');
  const locale = await getLocale();

  return (
    <>
      <section className="company-hero">
        <div className="wrap">
          <div className="breadcrumb">
            <a href={localizedPath(websitePath('/'), locale)}>{t('crumb.home')}</a>
            <span>{t('ui.slash')}</span>
            <span>{t('crumb.current')}</span>
          </div>
          <div className="company-intro">
            <div>
              <div className="eyebrow">{t('hero.eyebrow')}</div>
              <h1>
                {t('story.aiWord')}
                <br />
                <span>{t('hero.openKernel')}</span>
              </h1>
              <div className="en">{t('hero.title')}</div>
            </div>
            <div className="company-copy">
              <p>{t('story.line1')}</p>
              <p>{t('story.line2')}</p>
              <div className="company-links">
                <a className="textlink" href={localizedPath(websitePath('/about?section=team'), locale)}>
                  {t('team.cta')}
                  <span className="arrow">{t('ui.arrow')}</span>
                </a>
                <a className="textlink" href={localizedPath(websitePath('/about?section=company-contact'), locale)}>
                  {t('contact.cta')}
                  <span className="arrow">{t('ui.arrow')}</span>
                </a>
              </div>
            </div>
          </div>
          <div className="company-hami cncf-company">
            <div className="cncf-marks">
              <img src="/redesign/assets/0f7fb2749db6ecded91c.png" alt={t('cncf.hami')} />
              <i aria-hidden={true}></i>
              <img src="/redesign/assets/9dab0d76c74ff40c3076.svg" alt={t('cncf.org')} />
            </div>
            <div className="cncf-copy">
              <strong>{t('cncf.line')}</strong>
              <p>{t('cncf.hamiAlt')}</p>
            </div>
            <a className="cncf-tag" href="https://www.cncf.io/projects/hami/" target="_blank" rel="noopener">
              {t('cncf.badge')}
            </a>
          </div>
        </div>
      </section>
      <section className="company-interview section" id="infoq-interview" aria-labelledby="interview-title">
        <div className="wrap">
          <div className="interview-heading">
            <div>
              <div className="eyebrow">{t('interview.eyebrow')}</div>
              <h2 id="interview-title">{t('interview.title')}</h2>
            </div>
            <p>{t('interview.infoq')}</p>
          </div>
          <a
            className="interview-window"
            href="https://weixin.qq.com/sph/ANYS6O8oz2"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('interview.watch')}
          >
            <img
              src="/redesign/assets/infoq-interview-cover.jpg"
              width="1448"
              height="1086"
              loading="lazy"
              alt={t('interview.infoqAlt')}
            />
            <span className="interview-play" aria-hidden={true}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5.5v13l10-6.5z"></path>
              </svg>
            </span>
            <span className="interview-window-action">
              {t('interview.watch')}
              <span aria-hidden={true}>{t('ui.externalArrow')}</span>
            </span>
          </a>
          <div className="interview-caption">
            <span>{t('interview.hint')}</span>
          </div>
        </div>
      </section>

      <AboutTeamSection />

      <section className="section " id="company-contact">
        <div className="wrap">
          <div className="eyebrow">{t('contact.title')}</div>
          <h2>{t('contact.cta')}</h2>
          <div className="company-contact-grid">
            <a className="company-contact-card" href="mailto:info@dynamia.ai">
              <svg
                aria-hidden={true}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
              <strong>{t('contact.emailLabel')}</strong>
              <span>{t('contact.email')}</span>
            </a>
            <a
              className="company-contact-card"
              href="https://www.linkedin.com/company/dynamia-ai/"
              target="_blank"
              rel="noopener"
            >
              <svg aria-hidden={true} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                ></path>
              </svg>
              <strong>{t('contact.linkedin')}</strong>
              <span>{t('contact.follow')}</span>
            </a>
            <a className="company-contact-card" href="https://x.com/dynamia_ai" target="_blank" rel="noopener">
              <svg aria-hidden={true} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                  fill="currentColor"
                ></path>
              </svg>
              <strong>{t('contact.twitter')}</strong>
              <span>{t('contact.follow')}</span>
            </a>
            <AboutWeChatCard />
          </div>
        </div>
      </section>
    </>
  );
}
