import {NextResponse} from 'next/server';
import {readHamiMetricsCache, rememberHamiMetric} from '@/lib/site/hamiMetricsCache';

export const dynamic = 'force-dynamic';

const LFX_ACTIVE_CONTRIBUTORS =
  'https://insights.linuxfoundation.org/api/widget/contributors/active-contributors?project=hami&granularity=weekly&startDate&endDate&includeCollaborations=false';
const TTL = 60_000;

interface PullsSnapshot {
  pulls: number;
  fetchedAt: string;
}

interface ContributorsSnapshot {
  contributors: number;
  fetchedAt: string;
}

let pullsSnapshot: PullsSnapshot | null = null;
let pullsInflight: Promise<PullsSnapshot> | null = null;
let pullsRetryAfter = 0;

let contributorsSnapshot: ContributorsSnapshot | null = null;
let contributorsInflight: Promise<ContributorsSnapshot> | null = null;
let contributorsRetryAfter = 0;

function cachedPulls(): PullsSnapshot {
  const cache = readHamiMetricsCache();
  return {pulls: cache.pulls, fetchedAt: cache.fetchedAt};
}

function cachedContributors(): ContributorsSnapshot {
  const cache = readHamiMetricsCache();
  return {contributors: cache.contributors, fetchedAt: cache.fetchedAt};
}

async function latestPulls(): Promise<PullsSnapshot> {
  const response = await fetch('https://hub.docker.com/v2/repositories/projecthami/hami/', {
    headers: {Accept: 'application/json'},
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error('Docker Hub unavailable');
  const data = await response.json();
  if (
    data.namespace !== 'projecthami' ||
    data.name !== 'hami' ||
    !Number.isSafeInteger(data.pull_count) ||
    data.pull_count < 0
  ) {
    throw new Error('Invalid pull count');
  }
  const fetchedAt = new Date().toISOString();
  rememberHamiMetric('pulls', data.pull_count, fetchedAt);
  pullsSnapshot = {pulls: data.pull_count, fetchedAt};
  return pullsSnapshot;
}

async function latestContributors(): Promise<ContributorsSnapshot> {
  const response = await fetch(LFX_ACTIVE_CONTRIBUTORS, {
    headers: {Accept: 'application/json'},
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error('LFX Insights unavailable');
  const data = await response.json();
  const count = data?.summary?.current;
  if (!Number.isSafeInteger(count) || count < 0) throw new Error('Invalid contributor count');
  const fetchedAt = new Date().toISOString();
  rememberHamiMetric('contributors', count, fetchedAt);
  contributorsSnapshot = {contributors: count, fetchedAt};
  return contributorsSnapshot;
}

async function resolvePulls(): Promise<{snapshot: PullsSnapshot; stale: boolean}> {
  if (pullsSnapshot && Date.now() - Date.parse(pullsSnapshot.fetchedAt) < TTL) {
    return {snapshot: pullsSnapshot, stale: false};
  }
  if (Date.now() < pullsRetryAfter) {
    return {snapshot: pullsSnapshot ?? cachedPulls(), stale: true};
  }
  try {
    if (!pullsInflight) pullsInflight = latestPulls().finally(() => {pullsInflight = null;});
    return {snapshot: await pullsInflight, stale: false};
  } catch {
    pullsRetryAfter = Date.now() + TTL;
    return {snapshot: pullsSnapshot ?? cachedPulls(), stale: true};
  }
}

async function resolveContributors(): Promise<{snapshot: ContributorsSnapshot; stale: boolean}> {
  if (contributorsSnapshot && Date.now() - Date.parse(contributorsSnapshot.fetchedAt) < TTL) {
    return {snapshot: contributorsSnapshot, stale: false};
  }
  if (Date.now() < contributorsRetryAfter) {
    return {snapshot: contributorsSnapshot ?? cachedContributors(), stale: true};
  }
  try {
    if (!contributorsInflight) {
      contributorsInflight = latestContributors().finally(() => {contributorsInflight = null;});
    }
    return {snapshot: await contributorsInflight, stale: false};
  } catch {
    contributorsRetryAfter = Date.now() + TTL;
    return {snapshot: contributorsSnapshot ?? cachedContributors(), stale: true};
  }
}

export async function GET() {
  const headers = {'Cache-Control': 'no-store'};
  const [pulls, contributors] = await Promise.all([resolvePulls(), resolveContributors()]);
  return NextResponse.json(
    {
      pulls: pulls.snapshot.pulls,
      contributors: contributors.snapshot.contributors,
      stale: pulls.stale || contributors.stale,
    },
    {headers},
  );
}
