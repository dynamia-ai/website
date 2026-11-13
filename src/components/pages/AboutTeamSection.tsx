'use client';

import {useEffect, useRef, useState} from 'react';
import {useTranslations} from 'next-intl';

interface TeamDetail {
  title: string;
  body: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  tag: string;
  image: string;
  github?: string;
  linkedin?: string;
  bio?: string;
  details: TeamDetail[];
  linksBelowBio?: boolean;
}

const GITHUB_ICON = (
  <svg viewBox="0 0 24 24" aria-hidden={true}>
    <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03A9.6 9.6 0 0 1 12 6.96c.85 0 1.7.11 2.5.34 1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.85-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.61c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
  </svg>
);

function TeamSocial({member}: {member: TeamMember}) {
  if (!member.github && !member.linkedin) return null;
  return (
    <div className="social-links">
      {member.github ? (
        <a
          className="social-link"
          href={member.github}
          target="_blank"
          rel="noopener"
          aria-label={`${member.name} · GitHub`}
        >
          {GITHUB_ICON}
        </a>
      ) : null}
      {member.linkedin ? (
        <a
          className="social-link"
          href={member.linkedin}
          target="_blank"
          rel="noopener"
          aria-label={`${member.name} · LinkedIn`}
        >
          in
        </a>
      ) : null}
    </div>
  );
}

export default function AboutTeamSection() {
  const t = useTranslations('sitePages.about');
  const tDialog = useTranslations('sitePages.about.teamDialog');
  const members = t.raw('teamMembers') as TeamMember[];
  const teamDialogRef = useRef<HTMLDialogElement>(null);
  const [activeMember, setActiveMember] = useState<number | null>(null);

  const openMember = (index: number) => {
    const next = ((index % members.length) + members.length) % members.length;
    setActiveMember(next);
  };

  useEffect(() => {
    const dialog = teamDialogRef.current;
    if (!dialog) return;
    if (activeMember == null) {
      if (dialog.open) dialog.close();
      return;
    }
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    dialog.querySelector<HTMLElement>('.team-dialog-close')?.focus();
  }, [activeMember]);

  useEffect(() => {
    const dialog = teamDialogRef.current;
    if (!dialog) return;
    const onClick = (event: MouseEvent) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      ) {
        setActiveMember(null);
      }
    };
    const onCloseEvent = () => setActiveMember(null);
    dialog.addEventListener('click', onClick);
    dialog.addEventListener('close', onCloseEvent);
    return () => {
      dialog.removeEventListener('click', onClick);
      dialog.removeEventListener('close', onCloseEvent);
    };
  }, []);

  const member = activeMember == null ? null : members[activeMember];

  return (
    <>
      <section className="section team-section" id="team">
        <div className="wrap">
          <div className="team-heading">
            <div>
              <div className="eyebrow">{t('team.eyebrow')}</div>
              <h2>{t('team.title')}</h2>
            </div>
            <p>
              {t('team.lead1')}
              <br />
              {t('team.lead2')}
            </p>
          </div>
          <div className="team-grid">
            {members.map((item, index) => (
              <article className="member-card" key={item.id}>
                <button
                  className="member-open"
                  type="button"
                  data-member={String(index)}
                  aria-label={`${tDialog('learnMore')} · ${item.name}`}
                  onClick={() => openMember(index)}
                >
                  <div className="member-photo" data-person={item.id}>
                    <img src={item.image} alt={item.name} loading="eager" />
                    <span className="member-more" aria-hidden={true}>
                      ↗
                    </span>
                  </div>
                  <div className="member-name">
                    <h3>{item.name}</h3>
                  </div>
                  <p className="member-role">{item.role}</p>
                  <p className="member-tag">{item.tag}</p>
                </button>
                <div className="member-bottom">
                  <button
                    className="member-bio-link"
                    type="button"
                    data-member={String(index)}
                    onClick={() => openMember(index)}
                  >
                    {tDialog('learnMore')}
                    <span className="arrow">→</span>
                  </button>
                  <TeamSocial member={item} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <dialog ref={teamDialogRef} id="team-dialog" aria-labelledby="member-dialog-title">
        {member ? (
          <>
            <button
              className="team-dialog-close"
              type="button"
              aria-label={tDialog('closeAria')}
              data-close-member=""
              onClick={() => setActiveMember(null)}
            >
              {tDialog('close')}
            </button>
            <div className="team-dialog-grid">
              <div className="team-dialog-photo">
                <img data-person={member.id} src={member.image} alt={member.name} />
                {!member.linksBelowBio ? <TeamSocial member={member} /> : null}
              </div>
              <div className="team-dialog-info">
                <div className="eyebrow">{tDialog('eyebrow')}</div>
                <h2 id="member-dialog-title">{member.name}</h2>
                <div className="team-dialog-role">{member.role}</div>
                {member.bio ? <p className="team-dialog-bio">{member.bio}</p> : null}
                <div className="team-dialog-details">
                  {member.details.map((detail) => (
                    <div key={detail.title}>
                      <h3>{detail.title}</h3>
                      <p>{detail.body}</p>
                    </div>
                  ))}
                </div>
                {member.linksBelowBio ? <TeamSocial member={member} /> : null}
                <div className="team-dialog-nav">
                  <span>
                    {String((activeMember ?? 0) + 1).padStart(2, '0')}
                    {tDialog('separator')}
                    {String(members.length).padStart(2, '0')}
                  </span>
                  <div>
                    <button
                      type="button"
                      data-member-step="-1"
                      aria-label={tDialog('prevAria')}
                      onClick={() => openMember((activeMember ?? 0) - 1)}
                    >
                      {tDialog('prev')}
                    </button>
                    <button
                      type="button"
                      data-member-step="1"
                      aria-label={tDialog('nextAria')}
                      onClick={() => openMember((activeMember ?? 0) + 1)}
                    >
                      {tDialog('next')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </dialog>
    </>
  );
}
