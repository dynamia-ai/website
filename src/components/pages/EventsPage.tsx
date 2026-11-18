import {getLocale, getTranslations} from 'next-intl/server';
import SiteArrow from '@/components/layout/SiteArrow';
import Link from 'next/link';
import {getEventCatalog} from '@/lib/blog-server';
import {websitePath} from '@/lib/site/links';
import {localizedPath} from '@/utils/i18n';
import '@/styles/events.css';

interface EventItemCopy {
  title?: string;
  linkTitle?: string;
  body?: string;
  linkBody?: string;
  photoAlt?: string;
  date?: string;
  guest?: string;
  [key: string]: string | undefined;
}

export default async function EventsPage() {
  const t = await getTranslations('sitePages.events');
  const locale = await getLocale();
  const events = getEventCatalog(locale);
  const items = t.raw('items') as Record<string, EventItemCopy>;
  const places = t.raw('places') as Record<string, string>;
  const ui = t.raw('ui') as Record<string, string>;

  return (
    <>
      <section className="events-hero">
        <div className="wrap">
          <div className="eyebrow">{t('hero.eyebrow')}</div>
          <h1>{t('hero.title')}</h1>
          <p>
            {t('hero.lead1')}
            <br />
            {t('hero.lead2')}
          </p>
        </div>
      </section>

      <section className="event-content">
        <div className="wrap">
          <div id="event-results">
            {events.map((event) => {
              const {eventsPage} = event;
              const item = items[eventsPage.itemKey] || {};
              const titleField = eventsPage.titleField || 'title';
              const bodyField = eventsPage.bodyField || 'body';
              const imageAltField = eventsPage.imageAltField || 'photoAlt';
              const title = item[titleField] || '';
              const body = item[bodyField] || '';
              const imageAlt = item[imageAltField] || '';
              const date = item.date || '';
              const place = places[eventsPage.placeKey] || '';
              const cta = ui[eventsPage.ctaKey] || '';
              const caption = eventsPage.captionKey ? item[eventsPage.captionKey] : null;
              const href = localizedPath(websitePath(`/blog/${event.slug}`), locale);
              const coverClass = eventsPage.portrait
                ? 'event-cover event-photo event-photo-portrait'
                : 'event-cover event-photo';

              return (
                <article className="event-row" key={event.slug}>
                  <div>
                    <h2>
                      <Link href={href}>{title}</Link>
                    </h2>
                    <div className="event-meta">
                      <span>{date}</span>
                      <span>{place}</span>
                    </div>
                  </div>
                  <div className="event-description">
                    <p>{body}</p>
                    <Link className="textlink" href={href}>
                      {cta}
                      <SiteArrow variant="text" />
                    </Link>
                  </div>
                  <figure className="event-photo-figure">
                    <Link className={coverClass} href={href} aria-label={title}>
                      <img src={eventsPage.image} alt={imageAlt} loading="lazy" />
                    </Link>
                    {caption ? <figcaption>{caption}</figcaption> : null}
                  </figure>
                </article>
              );
            })}
          </div>
          <p className="event-note">{t('footerNote')}</p>
        </div>
      </section>
    </>
  );
}
