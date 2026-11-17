import {NextResponse} from 'next/server';
import {readHamiMetricsCache, rememberHamiMetric} from '@/lib/site/hamiMetricsCache';

export const dynamic = 'force-dynamic';

interface Snapshot {
  stars: number;
  fetchedAt: string;
}

let snapshot: Snapshot | null = null;
let inflight: Promise<Snapshot> | null = null;
let retryAfter = 0;
const TTL = 60_000;

function cachedSnapshot(): Snapshot {
  const cache = readHamiMetricsCache();
  return {stars: cache.stars, fetchedAt: cache.fetchedAt};
}

async function latest(): Promise<Snapshot> {
  const response = await fetch('https://api.github.com/repos/Project-HAMi/HAMi', {
    headers: {Accept: 'application/vnd.github+json', 'User-Agent': 'Dynamia-Website'},
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error('GitHub unavailable');
  const data = await response.json();
  if (!Number.isSafeInteger(data.stargazers_count) || data.stargazers_count < 0) {
    throw new Error('Invalid star count');
  }
  const fetchedAt = new Date().toISOString();
  rememberHamiMetric('stars', data.stargazers_count, fetchedAt);
  snapshot = {stars: data.stargazers_count, fetchedAt};
  return snapshot;
}

export async function GET() {
  const headers = {'Cache-Control': 'no-store'};
  if (snapshot && Date.now() - Date.parse(snapshot.fetchedAt) < TTL) {
    return NextResponse.json({...snapshot, stale: false}, {headers});
  }
  if (Date.now() < retryAfter) {
    return NextResponse.json({...(snapshot ?? cachedSnapshot()), stale: true}, {headers});
  }
  try {
    if (!inflight) inflight = latest().finally(() => {inflight = null;});
    return NextResponse.json({...await inflight, stale: false}, {headers});
  } catch {
    retryAfter = Date.now() + TTL;
    return NextResponse.json({...(snapshot ?? cachedSnapshot()), stale: true}, {headers});
  }
}
