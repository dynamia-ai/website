'use client';

import {createContext, useContext, useEffect, useState, type ReactNode} from 'react';
import {fetchHamiLiveStats, formatPulls, type HamiLiveStats} from '@/lib/site/hamiLiveStats';

const HamiLiveStatsContext = createContext<HamiLiveStats>({
  stars: null,
  contributors: null,
  pulls: null,
});

export function HamiLiveStatsProvider({children}: {children: ReactNode}) {
  const [stats, setStats] = useState<HamiLiveStats>({
    stars: null,
    contributors: null,
    pulls: null,
  });

  useEffect(() => {
    let cancelled = false;
    fetchHamiLiveStats().then((next) => {
      if (!cancelled) setStats(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return <HamiLiveStatsContext.Provider value={stats}>{children}</HamiLiveStatsContext.Provider>;
}

type StatKind = 'stars' | 'contributors' | 'pulls';

interface HamiLiveStatProps {
  kind: StatKind;
  placeholder: string;
  className?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
}

export function HamiLiveStat({kind, placeholder, className, ...rest}: HamiLiveStatProps) {
  const stats = useContext(HamiLiveStatsContext);
  let value: string = placeholder;
  if (kind === 'stars' && stats.stars != null) value = String(stats.stars);
  if (kind === 'contributors' && stats.contributors != null) value = String(stats.contributors);
  if (kind === 'pulls' && stats.pulls != null) value = formatPulls(stats.pulls);
  return (
    <span className={className} {...rest}>
      {value}
    </span>
  );
}
