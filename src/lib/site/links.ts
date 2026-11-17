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

/** Rewrite locale-free internal paths in rendered article HTML. */
export function localizeContentHtml(html: string, locale: string): string {
  return html.replace(
    /\bhref="(\/(?:blog|case-studies|products|tools|videos|resources|community|company|about|careers|events|pricing|privacy-policy|cookies-policy|apply-trial|get-practices|compatibility|faq|solutions)(?:\/[^"#?]*)?)"/g,
    (_all, path: string) => {
      const normalized = path.replace(/\/+$/, '') || '/';
      return `href="/${locale}${normalized === '/' ? '' : normalized}"`;
    },
  );
}
