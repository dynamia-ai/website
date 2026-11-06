import {NextResponse} from 'next/server';

export const dynamic = 'force-dynamic';
interface Snapshot {stars: number; fetchedAt: string}
let snapshot: Snapshot | null = null;
let inflight: Promise<Snapshot> | null = null;
let retryAfter = 0;
const TTL = 60_000;

async function latest(): Promise<Snapshot> {
  const response = await fetch('https://api.github.com/repos/Project-HAMi/HAMi', {
    headers: {Accept: 'application/vnd.github+json', 'User-Agent': 'Dynamia-Website'},
    cache: 'no-store', signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error('GitHub unavailable');
  const data = await response.json();
  if (!Number.isSafeInteger(data.stargazers_count) || data.stargazers_count < 0) {
    throw new Error('Invalid star count');
  }
  snapshot = {stars: data.stargazers_count, fetchedAt: new Date().toISOString()};
  return snapshot;
}

export async function GET() {
  const headers = {'Cache-Control': 'no-store'};
  if (snapshot && Date.now() - Date.parse(snapshot.fetchedAt) < TTL) {
    return NextResponse.json({...snapshot, stale: false}, {headers});
  }
  if (Date.now() < retryAfter) {
    return NextResponse.json(snapshot ? {...snapshot, stale: true} : {stars: null}, {status: snapshot ? 200 : 503, headers});
  }
  try {
    if (!inflight) inflight = latest().finally(() => {inflight = null;});
    return NextResponse.json({...await inflight, stale: false}, {headers});
  } catch {
    retryAfter = Date.now() + TTL;
    return NextResponse.json(snapshot ? {...snapshot, stale: true} : {stars: null}, {status: snapshot ? 200 : 503, headers});
  }
}
