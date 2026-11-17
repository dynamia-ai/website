import {getLocale, getTranslations} from 'next-intl/server';
import SiteArrow from '@/components/layout/SiteArrow';
import {localizedPath} from '@/utils/i18n';
import {websitePath} from '@/lib/site/links';
import '@/styles/tools.css';

type ToolId = 'metrics' | 'roi';

interface ToolCard {
  id: ToolId;
  href: string;
  icon: string;
}

const TOOL_CARDS: ToolCard[] = [
  {
    id: 'metrics',
    href: '/tools/hami-metrics-explorer',
    icon: 'M3 3v18h18 M7 16v-4 M12 16V7 M17 16v-7',
  },
  {
    id: 'roi',
    href: '/tools/hami-roi-calculator',
    icon: 'M6 6h12v12H6z M9 9h6v6H9z M9 3v3m6-3v3M9 18v3m6-3v3M3 9h3m-3 6h3m12-6h3m-3 6h3',
  },
];

export default async function ToolsPage() {
  const t = await getTranslations('sitePages.tools');
  const locale = await getLocale();

  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <div className="breadcrumb">
            <a href={localizedPath(websitePath('/'), locale)}>{t('crumb.home')}</a>
            <span>{t('ui.slash')}</span>
            <span>{t('crumb.current')}</span>
          </div>
          <div>
            <div className="eyebrow">{t('crumb.current')}</div>
            <h1>
              {t('hero.titleLine1')}
              <br />
              {t('hero.titleLine2')}
            </h1>
            <p className="lead">{t('hero.lead')}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="grid2 tool-cards">
            {TOOL_CARDS.map((item) => (
              <a
                className="feature-card"
                href={localizedPath(websitePath(item.href), locale)}
                key={item.id}
              >
                <span className="icon">
                  <svg viewBox="0 0 24 24" aria-hidden={true}>
                    <path d={item.icon} />
                  </svg>
                </span>
                <h3>{t(`cards.${item.id}.title`)}</h3>
                <p>{t(`cards.${item.id}.body`)}</p>
                <span className="textlink">
                  {t('cards.open')}
                  <SiteArrow variant="text" />
                </span>
              </a>
            ))}
          </div>
          <p className="tools-note">{t('note')}</p>
        </div>
      </section>
    </>
  );
}
