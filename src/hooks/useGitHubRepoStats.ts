'use client';

import { useEffect, useState } from 'react';

interface GitHubRepoStats {
  stars: number;
  forks: number;
}

const TTL_MS = 10 * 60 * 1000;

const cache = new Map<string, { data: GitHubRepoStats; fetchedAt: number }>();
const inflight = new Map<string, Promise<GitHubRepoStats | null>>();

export function formatCompactCount(num: number): string {
  if (num >= 1000) {
    const thousands = num / 1000;
    const rounded = thousands >= 10 ? Math.round(thousands) : Math.round(thousands * 10) / 10;
    return `${rounded}K`;
  }
  if (num >= 100) {
    return `${Math.floor(num / 100) * 100}+`;
  }
  return String(num);
}

async function fetchGitHubRepoStats(repo: string): Promise<GitHubRepoStats | null> {
  const cached = cache.get(repo);
  if (cached && Date.now() - cached.fetchedAt < TTL_MS) {
    return cached.data;
  }

  const existing = inflight.get(repo);
  if (existing) return existing;

  const request = (async () => {
    try {
      const response = await fetch(`https://api.github.com/repos/${repo}`);
      if (!response.ok) {
        if (process.env.NODE_ENV === 'development') {
          console.error(`GitHub API 请求失败：${response.status}`);
        }
        return cached?.data ?? null;
      }

      const data = await response.json();
      const stats: GitHubRepoStats = {
        stars: Number(data.stargazers_count) || 0,
        forks: Number(data.forks_count) || 0,
      };
      cache.set(repo, { data: stats, fetchedAt: Date.now() });
      return stats;
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('获取 GitHub repo stats 失败：', err);
      }
      return cached?.data ?? null;
    } finally {
      inflight.delete(repo);
    }
  })();

  inflight.set(repo, request);
  return request;
}

export function useGitHubRepoStats(repo: string): GitHubRepoStats | null {
  const [stats, setStats] = useState<GitHubRepoStats | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchGitHubRepoStats(repo).then((data) => {
      if (!cancelled && data) setStats(data);
    });

    return () => {
      cancelled = true;
    };
  }, [repo]);

  return stats;
}
