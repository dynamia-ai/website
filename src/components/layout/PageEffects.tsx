'use client';

import {useEffect} from 'react';
import {usePathname} from '@/i18n/navigation';

/** Route-level chrome effects that are not page-owned React state. */
export default function PageEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const section = params.get('section');
    requestAnimationFrame(() => {
      if (section) {
        document.getElementById(section)?.scrollIntoView({behavior: 'smooth'});
      }
    });
  }, [pathname]);

  return null;
}
