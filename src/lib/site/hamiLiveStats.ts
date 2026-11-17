export interface HamiLiveStats {
  stars: number | null;
  contributors: number | null;
  pulls: number | null;
}

export function formatPulls(pulls: number): string {
  return `${new Intl.NumberFormat('en-US').format(Math.floor(pulls / 1000))}K`;
}

export async function fetchHamiLiveStats(): Promise<HamiLiveStats> {
  const empty: HamiLiveStats = {stars: null, contributors: null, pulls: null};
  try {
    const [github, community] = await Promise.all([
      fetch('/api/github/hami').then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch('/api/community/hami').then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]);
    return {
      stars: github?.stars != null ? Number(github.stars) : null,
      contributors: community?.contributors != null ? Number(community.contributors) : null,
      pulls: community?.pulls != null ? Number(community.pulls) : null,
    };
  } catch {
    return empty;
  }
}
