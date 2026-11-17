import seed from '@/data/hami-metrics-cache.json';

export interface HamiMetricsCache {
  stars: number;
  pulls: number;
  contributors: number;
  fetchedAt: string;
}

type MetricKey = 'stars' | 'pulls' | 'contributors';

let memory: HamiMetricsCache | null = null;

function isValidCache(value: unknown): value is HamiMetricsCache {
  if (!value || typeof value !== 'object') return false;
  const data = value as Record<string, unknown>;
  return (
    Number.isSafeInteger(data.stars) &&
    (data.stars as number) >= 0 &&
    Number.isSafeInteger(data.pulls) &&
    (data.pulls as number) >= 0 &&
    Number.isSafeInteger(data.contributors) &&
    (data.contributors as number) >= 0 &&
    typeof data.fetchedAt === 'string'
  );
}

/** Last-known-good metrics: memory → committed seed. */
export function readHamiMetricsCache(): HamiMetricsCache {
  if (memory && isValidCache(memory)) return memory;
  memory = {
    stars: seed.stars,
    pulls: seed.pulls,
    contributors: seed.contributors,
    fetchedAt: seed.fetchedAt,
  };
  return memory;
}

export function rememberHamiMetric(
  key: MetricKey,
  value: number,
  fetchedAt = new Date().toISOString(),
): HamiMetricsCache {
  const next: HamiMetricsCache = {
    ...readHamiMetricsCache(),
    [key]: value,
    fetchedAt,
  };
  memory = next;
  return next;
}
