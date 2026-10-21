import {NextResponse} from 'next/server';

export const dynamic = 'force-dynamic';
const SOURCE = 'https://hub.docker.com/r/projecthami/hami';
const TTL = 60_000;
interface Snapshot {pulls: number; fetchedAt: string; source: string; scope: 'all-time'}
let snapshot: Snapshot | null = null;
let inflight: Promise<Snapshot> | null = null;
let retryAfter = 0;

async function latest(): Promise<Snapshot> {
  const response = await fetch('https://hub.docker.com/v2/repositories/projecthami/hami/', {
    headers: {Accept: 'application/json'}, cache: 'no-store', signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error('Docker Hub unavailable');
  const data = await response.json();
  if (data.namespace !== 'projecthami' || data.name !== 'hami' ||
      !Number.isSafeInteger(data.pull_count) || data.pull_count < 0) throw new Error('Invalid pull count');
  snapshot = {pulls: data.pull_count, fetchedAt: new Date().toISOString(), source: SOURCE, scope: 'all-time'};
  return snapshot;
}

export async function GET() {
  const headers = {'Cache-Control': 'no-store'};
  if (snapshot && Date.now() - Date.parse(snapshot.fetchedAt) < TTL) {
    return NextResponse.json({...snapshot, stale: false}, {headers});
  }
  if (Date.now() < retryAfter) {
    return NextResponse.json(snapshot ? {...snapshot, stale: true} : {pulls: null, source: SOURCE}, {status: snapshot ? 200 : 503, headers});
  }
  try {
    if (!inflight) inflight = latest().finally(() => {inflight = null;});
    return NextResponse.json({...await inflight, stale: false}, {headers});
  } catch {
    retryAfter = Date.now() + TTL;
    return NextResponse.json(snapshot ? {...snapshot, stale: true} : {pulls: null, source: SOURCE}, {status: snapshot ? 200 : 503, headers});
  }
}
