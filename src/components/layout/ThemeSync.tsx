'use client';

import {useEffect} from 'react';

/** Keep html.dark in sync with site theme (dataset is set by the root layout boot script). */
export default function ThemeSync() {
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem('dynamia-demo-theme');
    } catch {
      // ignore storage failures
    }
    const dark =
      saved === 'dark' ||
      (saved !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  return null;
}
