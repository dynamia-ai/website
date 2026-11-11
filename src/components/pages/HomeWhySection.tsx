'use client';

import {useState, type KeyboardEvent} from 'react';
import {useTranslations} from 'next-intl';

interface WhyPanel {
  label: string;
  title: string;
  body: string;
}

export default function HomeWhySection() {
  const t = useTranslations('sitePages.home');
  const whyPanels = t.raw('why.panels') as WhyPanel[];
  const [whyIndex, setWhyIndex] = useState(0);
  const activeWhy = whyPanels[whyIndex] ?? whyPanels[0];
  const whyTag = `${String(whyIndex + 1).padStart(2, '0')} / `;

  const onWhyKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!whyPanels.length) return;
    const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    let next = whyIndex;
    if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = whyPanels.length - 1;
    else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      next = (whyIndex + 1) % whyPanels.length;
    } else {
      next = (whyIndex - 1 + whyPanels.length) % whyPanels.length;
    }
    setWhyIndex(next);
    document.getElementById(`why-tab-${next}`)?.focus();
  };

  return (
    <section className="section tinted" id="why-us">
      <div className="wrap">
        <div className="intro">
          <div>
            <div className="eyebrow">{t('why.eyebrow')}</div>
            <h2>{t('why.title')}</h2>
            <p>{t('why.description')}</p>
          </div>
        </div>
        <div className="why-tabs" role="tablist" aria-label={t('why.title')} onKeyDown={onWhyKeyDown}>
          {whyPanels.map((panel, index) => {
            const active = index === whyIndex;
            return (
              <button
                key={panel.label}
                type="button"
                role="tab"
                id={`why-tab-${index}`}
                aria-controls="why-panel"
                aria-selected={active}
                tabIndex={active ? 0 : -1}
                data-why={String(index)}
                onClick={() => setWhyIndex(index)}
              >
                {panel.label}
              </button>
            );
          })}
        </div>
        <div id="why-panel" role="tabpanel" tabIndex={0} aria-labelledby={`why-tab-${whyIndex}`}>
          <div className="why-panel">
            <div>
              <span className="tag">
                <span>{whyTag}</span>
                <span>{activeWhy?.label}</span>
              </span>
              <h3>{activeWhy?.title}</h3>
              <p>{activeWhy?.body}</p>
            </div>
            <div className="why-visual why-visual-approved">
              <iframe
                src={`/redesign/compute-motion/revised.html?scene=${whyIndex}`}
                title={activeWhy?.label}
                scrolling="no"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
