const routePaths: Record<string, string> = {
  '/about': '/company',
  '/cases': '/case-studies',
  '/enterprise': '/products/hami-enterprise',
  '/platform': '/products/hami-ai-platform',
  '/contact-sales': '/apply-trial',
  '/what-is-hami': '/community',
  '/opensource': '/community',
  '/compare': '/products',
};

export function websitePath(route: string): string {
  const split = route.search(/[?#]/);
  const pathname = split < 0 ? route : route.slice(0, split);
  const suffix = split < 0 ? '' : route.slice(split);
  if (pathname === '/case-studies/ke-holdings') return '/case-studies/ke-holdings-inc' + suffix;
  if (pathname.startsWith('/cases/')) return pathname.replace('/cases/', '/case-studies/') + suffix;
  return (routePaths[pathname] || pathname) + suffix;
}

export function localLink(href: string, basePath: string): string {
  let path = '';
  if (href.startsWith('#/')) path = websitePath(href.slice(1));
  else if (/^https?:\/\/(?:www\.)?dynamia\.ai(?:\/|$)/.test(href)) {
    const url = new URL(href);
    path = url.pathname.replace(/^\/(?:zh|en|de)(?=\/|$)/, '') || '/';
    path = path.replace(/\/$/,'') || '/';
    const repairs: Record<string,string> = {
      '/blog/Run':'/blog/run-ai-kai-scheduler-vs-hami',
      '/blog/open-source-vgpu-hami-Spread-Binpack':'/blog/open-source-vgpu-spread-binpack',
      '/blog/open-source-vgpu-hami-fine-grained-partitioningg':'/blog/open-source-vgpu-hami-fine-grained-partitioning',
    };
    path = repairs[path] || path;
    if (path.includes('koordinator.sh/docs/next/best-practices/gpu-and-rdma-joint-allocation')) {
      return 'https://koordinator.sh/docs/next/best-practices/gpu-and-rdma-joint-allocation/';
    }
    // These original-site links are download CTAs in the approved overview.
    if (/^\/products\/(?:hami-enterprise|hami-ai-platform)$/.test(path)) path += '/downloads';
    // Brand assets are locale-independent.
    if (/\.(?:png|svg|jpe?g|gif|webp|pdf|zip|gz|txt)$/i.test(path)) return path;
    path = websitePath(path) + url.search + url.hash;
  } else return href;
  const prefix = basePath === '/' ? '' : basePath.replace(/\/$/, '');
  return prefix + (path === '/' ? '' : path) || '/';
}

export function demoPath(pathname: string, basePath: string): string {
  const prefix = basePath === '/' ? '' : basePath.replace(/\/$/, '');
  const path = pathname.slice(prefix.length) || '/';
  if (path.startsWith('/case-studies/')) return path.replace('/case-studies/', '/cases/');
  return Object.entries(routePaths).find(([, value]) => value === path)?.[0] || path;
}

export function localizeMarkup(html: string, basePath: string): string {
  return html.replace(/\b(href|src)="([^"]*)"/g, (_all, attribute: string, href: string) =>
    `${attribute}="${localLink(href, basePath)}"`);
}
