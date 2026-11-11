'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
import {useTranslations} from 'next-intl';

type Department = 'all' | 'sales' | 'engineering' | 'product';

interface CareerRole {
  id: string;
  department: Exclude<Department, 'all'>;
  title: string;
  experience: string;
  cardDescription: string;
  duties: string[];
  requirements: string[];
  bonus?: string[];
}

export default function CareersBoard() {
  const t = useTranslations('sitePages.careers');
  const roles = t.raw('roles') as CareerRole[];
  const [filter, setFilter] = useState<Department>('all');
  const [openRoleId, setOpenRoleId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const visibleRoles = useMemo(
    () => roles.filter((role) => filter === 'all' || role.department === filter),
    [roles, filter],
  );

  const openRole = roles.find((role) => role.id === openRoleId) || null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (openRole) {
      if (!dialog.open) dialog.showModal();
      dialog.querySelector<HTMLElement>('.career-dialog-close')?.focus();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [openRole]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => setOpenRoleId(null);
    const onClick = (event: MouseEvent) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      if (!inside) dialog.close();
    };
    dialog.addEventListener('close', onClose);
    dialog.addEventListener('click', onClick);
    return () => {
      dialog.removeEventListener('close', onClose);
      dialog.removeEventListener('click', onClick);
    };
  }, []);

  function applyHref(roleTitle: string) {
    const subject = t('apply.mailSubject', {role: roleTitle});
    const body = t('apply.mailBody', {role: roleTitle});
    return `mailto:${t('apply.email')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function departmentLabel(department: CareerRole['department']) {
    const labels = t.raw('department') as Record<CareerRole['department'], string>;
    return labels[department];
  }

  const filters: {id: Department; label: string}[] = [
    {id: 'all', label: t('filter.all')},
    {id: 'sales', label: t('department.sales')},
    {id: 'engineering', label: t('department.engineering')},
    {id: 'product', label: t('department.product')},
  ];

  return (
    <>
      <section className="career-openings">
        <div className="wrap">
          <div className="career-openings-heading">
            <h2>{t('openings.title')}</h2>
            <p>{t('openings.description')}</p>
          </div>

          <div className="career-filters" role="group" aria-label={t('filter.label')}>
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={filter === item.id}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="career-role-grid">
            {visibleRoles.map((role) => (
              <article key={role.id} className="career-role-card" data-career-category={role.department}>
                <div className="career-role-heading">
                  <span>{departmentLabel(role.department)}</span>
                  <h3>{role.title}</h3>
                  <p>{role.experience}</p>
                </div>
                <p className="career-role-description">{role.cardDescription}</p>
                <div className="career-card-actions">
                  <a className="btn primary" href={applyHref(role.title)}>
                    {t('applyNow')}
                  </a>
                  <button
                    type="button"
                    className="career-details-link"
                    aria-haspopup="dialog"
                    onClick={() => setOpenRoleId(role.id)}
                  >
                    {t('detailsShort')}
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className="career-contact">
            <div>
              <h2>{t('contact.title')}</h2>
              <p>{t('contact.description')}</p>
              <a className="career-contact-email" href={`mailto:${t('apply.email')}`}>
                {t('apply.email')}
              </a>
            </div>
            <a
              className="btn primary"
              href={`mailto:${t('apply.email')}?subject=${encodeURIComponent(t('contact.subject'))}`}
            >
              {t('contact.button')}
            </a>
          </aside>
        </div>
      </section>

      <dialog
        ref={dialogRef}
        className="career-job-dialog"
        aria-labelledby={openRole ? `career-dialog-title-${openRole.id}` : undefined}
      >
        {openRole ? (
          <>
            <div className="career-dialog-heading">
              <span>{departmentLabel(openRole.department)}</span>
              <h2 id={`career-dialog-title-${openRole.id}`}>{openRole.title}</h2>
              <p>{openRole.experience}</p>
              <button
                type="button"
                className="career-dialog-close"
                aria-label={t('detailsClose')}
                onClick={() => setOpenRoleId(null)}
              >
                ×
              </button>
            </div>
            <div className="career-dialog-body">
              <section className="career-detail-group">
                <h3>{t('duties')}</h3>
                <ul>
                  {openRole.duties.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
              <section className="career-detail-group">
                <h3>{t('requirements')}</h3>
                <ul>
                  {openRole.requirements.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
              {openRole.bonus?.length ? (
                <section className="career-detail-group">
                  <h3>{t('bonus')}</h3>
                  <ul>
                    {openRole.bonus.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
            <div className="career-dialog-footer">
              <a href={`mailto:${t('apply.email')}`}>{t('apply.email')}</a>
              <a className="btn primary" href={applyHref(openRole.title)}>
                {t('applyNow')}
              </a>
            </div>
          </>
        ) : null}
      </dialog>
    </>
  );
}
