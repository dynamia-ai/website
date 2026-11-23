import {getLocale, getTranslations} from 'next-intl/server';
import SiteArrow from '@/components/layout/SiteArrow';
import Link from 'next/link';
import type {EventArticleSlug} from '@/lib/event-article-slugs';
import {websitePath} from '@/lib/site/links';
import {localizedPath} from '@/utils/i18n';
import '@/styles/events.css';

interface EventItem {
  /** Must match an entry in EVENT_ARTICLE_SLUGS when linking to a detail page. */
  slug?: EventArticleSlug;
  titleKey: string;
  dateKey: string;
  placeKey: string;
  bodyKey: string;
  ctaKey?: string;
  image: string;
  imageAltKey: string;
  portrait?: boolean;
  captionKey?: string;
}

const EVENTS: EventItem[] = [
  {
    slug: 'hami-incubating-community-night',
    titleKey: 'items.communityNight.title',
    dateKey: 'items.communityNight.date',
    placeKey: 'places.shanghai',
    bodyKey: 'items.communityNight.body',
    ctaKey: 'ui.readRecap',
    image: '/redesign/assets/d8e98dc53b24974446f6.png',
    imageAltKey: 'items.communityNight.photoAlt',
  },
  {
    slug: 'hami-meetup-shanghai-2026',
    titleKey: 'items.shanghaiSpecial.title',
    dateKey: 'items.shanghaiSpecial.date',
    placeKey: 'places.shanghai',
    bodyKey: 'items.shanghaiSpecial.body',
    ctaKey: 'ui.readRecap',
    image: '/redesign/assets/f3ec370573587df8b44d.jpg',
    imageAltKey: 'items.shanghaiSpecial.photoAlt',
  },
  {
    slug: 'hami-at-kubecon-india-2026',
    titleKey: 'items.kubeconIndia.title',
    dateKey: 'items.kubeconIndia.date',
    placeKey: 'places.mumbai',
    bodyKey: 'items.kubeconIndia.body',
    ctaKey: 'ui.viewCampaign',
    image: '/redesign/assets/22219a4000d21c3913b8.png',
    imageAltKey: 'items.kubeconIndia.photoAlt',
  },
  {
    slug: 'hami-2.9-webinar-recap',
    titleKey: 'items.webinar29.title',
    dateKey: 'items.webinar29.date',
    placeKey: 'places.webinarChannel',
    bodyKey: 'items.webinar29.body',
    ctaKey: 'ui.readLive',
    image: '/redesign/assets/0f0face961041678d9ac.png',
    imageAltKey: 'items.webinar29.photoAlt',
    portrait: true,
    captionKey: 'items.webinar29.guest',
  },
  {
    slug: 'hami-meetup-shenzhen-recap',
    titleKey: 'items.shenzhen.title',
    dateKey: 'items.shenzhen.date',
    placeKey: 'places.shenzhen',
    bodyKey: 'items.shenzhen.body',
    ctaKey: 'ui.readRecap',
    image: '/redesign/assets/9adcfe16b1696313f773.webp',
    imageAltKey: 'items.shenzhen.photoAlt',
  },
  {
    slug: 'kubecon-eu-2026-hami-recap',
    titleKey: 'items.kubeconEu.title',
    dateKey: 'items.kubeconEu.date',
    placeKey: 'places.amsterdam',
    bodyKey: 'items.kubeconEu.body',
    ctaKey: 'ui.readRecap',
    image: '/redesign/assets/e6fc62f061c19423122b.jpg',
    imageAltKey: 'items.kubeconEu.photoAlt',
  },
  {
    slug: 'dynamia-and-hami-at-kubecon-eu-2026',
    titleKey: 'items.kubeconEu.linkTitle',
    dateKey: 'items.kubeconEu.date',
    placeKey: 'places.amsterdam',
    bodyKey: 'items.kubeconEu.linkBody',
    ctaKey: 'ui.readPreview',
    image: '/images/events/dynamia-and-hami-at-kubecon-eu-2026/kubecon-eu-2026.png',
    imageAltKey: 'items.kubeconEu.photoAlt',
  },
  {
    slug: 'hami-meetup-beijing-recap',
    titleKey: 'items.beijing.title',
    dateKey: 'items.beijing.date',
    placeKey: 'places.beijing',
    bodyKey: 'items.beijing.body',
    ctaKey: 'ui.readRecap',
    image: '/redesign/assets/248d187773d7c891a2c7.webp',
    imageAltKey: 'items.beijing.photoAlt',
  },
  {
    slug: 'hami-meetup-shanghai',
    titleKey: 'items.shanghaiFirst.title',
    dateKey: 'items.shanghaiFirst.date',
    placeKey: 'places.shanghai',
    bodyKey: 'items.shanghaiFirst.body',
    ctaKey: 'ui.readRecap',
    image: '/redesign/assets/d6e3f43f4a67602a15c0.png',
    imageAltKey: 'items.shanghaiFirst.photoAlt',
  },
];

export default async function EventsPage() {
  const t = await getTranslations('sitePages.events');
  const locale = await getLocale();

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
            {EVENTS.map((event) => {
              const href = event.slug ? localizedPath(websitePath(`/events/${event.slug}`), locale) : undefined;
              const coverClass = event.portrait
                ? 'event-cover event-photo event-photo-portrait'
                : 'event-cover event-photo';

              return (
                <article className="event-row" key={event.slug + event.titleKey}>
                  <div>
                    <h2>
                      {href ? <Link href={href}>{t(event.titleKey)}</Link> : t(event.titleKey)}
                    </h2>
                    <div className="event-meta">
                      <span>{t(event.dateKey)}</span>
                      <span>{t(event.placeKey)}</span>
                    </div>
                  </div>
                  <div className="event-description">
                    <p>{t(event.bodyKey)}</p>
                    {href && event.ctaKey ? (
                      <Link className="textlink" href={href}>
                        {t(event.ctaKey)}
                        <SiteArrow variant="text" />
                      </Link>
                    ) : null}
                  </div>
                  <figure className="event-photo-figure">
                    {href ? (
                      <Link className={coverClass} href={href} aria-label={t(event.titleKey)}>
                        <img src={event.image} alt={t(event.imageAltKey)} loading="lazy" />
                      </Link>
                    ) : (
                      <div className={coverClass}>
                        <img src={event.image} alt={t(event.imageAltKey)} loading="lazy" />
                      </div>
                    )}
                    {event.captionKey ? <figcaption>{t(event.captionKey)}</figcaption> : null}
                  </figure>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
