import {getLocale, getTranslations} from 'next-intl/server';
import CommunityWeChatCard from '@/components/pages/CommunityWeChatCard';
import {localizedPath} from '@/utils/i18n';
import {websitePath} from '@/lib/site/links';

export default async function CommunityPage() {
  const t = await getTranslations('sitePages.community');
  const locale = await getLocale();

  return (
    <>
      <section className="community-page-hero">
        <div className="wrap">
          <div className="eyebrow">{t('hero.eyebrow')}</div>
          <h1>
            {t('hero.titleLine1')}
            <br />
            {t('hero.titleLine2')}
          </h1>
          <p>{t('hero.lead')}</p>
        </div>
      </section>
      <div className="wrap community-questions">
        <section className="community-question" id="what-is-hami">
          <div className="question-title">
            <small>{t('toc.hami')}</small>
            <h2>{t('hami.eyebrow')}</h2>
          </div>
          <div className="question-answer">
            <div className="community-hami-mark">
              <img src="/redesign/assets/0f7fb2749db6ecded91c.png" alt={t('hami.name')} />
              <a href="https://www.cncf.io/projects/hami/" target="_blank" rel="noopener">{t('hami.badge')}</a>
            </div>
            <p>{t('hami.body1')}</p>
            <p>{t('hami.body2')}</p>
            <div className="actions community-project-links">
              <a className="btn primary" href="https://github.com/Project-HAMi/HAMi" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" aria-hidden={true}><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03A9.6 9.6 0 0 1 12 6.96c.85 0 1.7.11 2.5.34 1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.85-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.61c0 .27.18.58.69.48A10 10 0 0 0 12 2z"></path></svg>
                {t('hami.github')}
              </a>
              <a className="btn" href="https://project-hami.io/" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" aria-hidden={true} fill="none" stroke="currentColor" strokeWidth="1.7">
                  <circle cx="12" cy="12" r="9"></circle>
                  <ellipse cx="12" cy="12" rx="4" ry="9"></ellipse>
                  <path d="M3 12h18"></path>
                </svg>
                {t('hami.website')}
              </a>
            </div>
            <figure className="community-ecosystem"><a href="/redesign/assets/hami-open-ecosystem.png" target="_blank" rel="noopener"><img src="/redesign/assets/hami-open-ecosystem.png" width="2074" height="1007" loading="lazy" alt={t('hami.diagramAlt')} /></a></figure>
          </div>
        </section>
        <section className="community-question" id="dynamia-and-hami">
          <div className="question-title">
            <small>{t('toc.relation')}</small>
            <h2>{t('relation.title')}</h2>
          </div>
          <div className="question-answer">
            <p>{t('relation.body1')}</p>
            <p>{t('relation.body2')}</p>
            <a className="textlink" href={localizedPath(websitePath("/about"), locale)}>{t('relation.aboutLink')}</a>
          </div>
        </section>
        <section className="community-question" id="follow-us">
          <div className="question-title">
            <small>{t('toc.channels')}</small>
            <h2>{t('channels.title')}</h2>
          </div>
          <div className="question-answer">
            <p>{t('channels.lead')}</p>
            <div className="social-cards">
              <a className="social-card" href="https://space.bilibili.com/1105878584" target="_blank" rel="noopener">
                <img src="/redesign/assets/0774a2c59c7c0e6c9d07.svg" alt="" loading="lazy" />
                <strong>{t('channels.bilibili.name')}</strong>
                <span>{t('channels.bilibili.hint')}</span>
              </a>
              <a className="social-card" href="https://cloud-native.slack.com/archives/C07T10BU4R2" target="_blank" rel="noopener">
                <img src="/redesign/assets/8d4d094f28508d217688.svg" alt="" loading="lazy" />
                <strong>{t('channels.slack.name')}</strong>
                <span>{t('channels.slack.hint')}</span>
              </a>
              <a className="social-card" href="https://discord.gg/AgdQt5Xp" target="_blank" rel="noopener">
                <img src="/redesign/assets/5351286139f73f15ed36.svg" alt="" loading="lazy" />
                <strong>{t('channels.discord.name')}</strong>
                <span>{t('channels.slack.hint')}</span>
              </a>
              <a className="social-card" href="https://www.reddit.com/r/HAMi_Community/" target="_blank" rel="noopener">
                <img src="/redesign/assets/51474680ab252231209a.svg" alt="" loading="lazy" />
                <strong>{t('channels.reddit.name')}</strong>
                <span>{t('channels.reddit.hint')}</span>
              </a>
              <CommunityWeChatCard />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
