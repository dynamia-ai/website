# AGENTS.md

Next.js 15 codebase. Be brief, be direct.

## Build & Development Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm start            # Start production server
npm run lint         # Linting
npm run algolia:index # Generate Algolia search index
```

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **React:** 19
- **Language:** TypeScript 5 (strict mode)
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **i18n:** next-intl (server + client), locale prefix `as-needed`
- **Fonts:** Geist Sans & Geist Mono

## Project Structure

```text
src/
├── app/
│   ├── [locale]/           # Locale-prefixed routes (all pages go here)
│   │   ├── layout.tsx       # Root layout with NextIntlClientProvider
│   │   ├── products/
│   │   │   ├── page.tsx     # Product listing
│   │   │   └── [productId]/ # Dynamic product detail
│   │   ├── case-studies/
│   │   │   ├── page.tsx     # Case study listing
│   │   │   └── [slug]/      # Dynamic case study detail
│   │   └── blog/[slug]/     # Dynamic blog posts
│   ├── api/                 # API routes
│   └── globals.css
├── components/
│   ├── layout/              # Header, Footer, MainLayout
│   ├── enterprise/          # Enterprise product components
│   └── ...
├── dictionary/              # next-intl translation files
│   ├── en.json
│   ├── zh.json
│   └── de.json
├── i18n/
│   ├── routing.ts           # Locale config + Locale type export
│   ├── request.ts           # next-intl request config
│   └── navigation.ts        # Link/useRouter/usePathname wrappers
├── utils/
│   ├── i18n.ts              # localizedPath, localizedUrl, shortenDescription
│   └── seo.ts               # (deprecated — use @/utils/i18n)
├── lib/                     # Utility functions
└── types/                   # TypeScript interfaces
```

**Path Alias:** `@/*` maps to `./src/*`

## Internationalization (next-intl)

This project uses **next-intl**, not react-i18next. It works in both server and client components.

### Dictionary files

All user-facing text goes into `dictionary/{locale}.json`. Never hardcode strings in components.

```
dictionary/
├── en.json    # English (default)
├── zh.json    # Chinese
└── de.json    # German
```

### Server components

```tsx
import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'enterprise' });
  return <h1>{t('detail.title')}</h1>;
}
```

### Client components

```tsx
'use client';
import { useTranslations, useLocale } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('enterprise');  // namespace
  const locale = useLocale();               // current locale
  return <h1>{t('detail.title')}</h1>;
}
```

### Structured data from dictionary

Use `t.raw()` to get objects/arrays:

```tsx
const c = t.raw('scope');           // returns localized object
const groups = t.raw('scope.groups'); // returns localized array
```

### Path helpers

Always use `@/utils/i18n` for locale-aware paths — never hardcode `zh` prefix checks:

```tsx
import { localizedPath } from '@/utils/i18n';

// Good
<Link href={localizedPath('/products', locale)}>Products</Link>

// Bad — never do this
<Link href={locale === 'zh' ? '/zh/products' : '/products'}>Products</Link>
```

### Routing

```tsx
import { routing } from '@/i18n/routing';
// routing.locales       → ['en', 'zh', 'de']
// routing.defaultLocale → 'en'
```

**Locale type** is exported from routing, not hardcoded:

```tsx
import type { Locale } from '@/i18n/routing';  // 'en' | 'zh' | 'de'
```

### Language switcher

Uses the `LanguageSwitcher` component from `@/components/LanguageSwitcher`. It handles cookie setting and next-intl navigation.

## i18n Rules (CRITICAL)

1. **All text in dictionaries.** No hardcoded strings, no `{en, zh}` objects in code. Remove them when migrating.
2. **`[locale]` routing only.** All pages under `src/app/[locale]/`. No `/zh/` or bare `products/` directories.
3. **`localizedPath()` for all links.** Never `locale === 'zh' ? '/zh/...' : '/...'`.
4. **`useLocale()` in client components.** Don't pass `locale` as a prop. Every client component in the provider has it.
5. **Namespaced translators.** `useTranslations('enterprise')`, then `t('detail.title')` — not `t('enterprise.detail.title')` with root translator. Mixing namespace with prefixed keys causes double-prefix bugs (`enterprise.enterprise.*`).
6. **No `{en, zh}` in data.** Product names, taglines, labels go in dictionaries. `I18nText` has index signature for any locale.
7. **No `[locale]` indexing.** If code does `obj[locale] ?? obj.en`, the data belongs in a dictionary accessed via `t()` or `t.raw()`.
8. **Dynamic keys via `t.raw()`.** Template-literal keys (`t(\`status.${x}\`)`) need `as any`. Prefer `t.raw()` to get the parent object, then index:
   ```tsx
   const pd = (t.raw('productsData') as any)?.[productId];
   ```
9. **Remove dead code.** Delete COPY, CHROME, PRODUCT_INTRO, STATUS_LABEL, GROUPS text objects after migrating to dictionaries.
10. **Dynamic `[slug]` routes.** One page file, not per-item directories. Case studies, blog, products all use this.
11. **`{count}` not `{{count}}`.** ICU interpolation uses single braces.
12. **Locale type from routing.** `import type { Locale } from '@/i18n/routing'` — never hardcode `'en' | 'zh' | 'de'`.
13. **Lib functions accept `string` locale.** No `locale: 'en' | 'zh'` in function signatures. Default to `'en'`, not `'zh'`.
14. **`enhanceCodeBlocks` takes labels, not locale.** Pass `{ copy, copied, failed, aria }` from dictionary, not a locale string.
15. **Logo/images from dictionary.** `t('navigation.logo')` / `t('navigation.logoDark')` — per-locale paths.
16. **No `pickI18n`.** Removed. Use dictionary lookups.
17. **No `language` field in doc types.** Locale IS the language. Pass it directly.
18. **Locale regex: `/\.[a-z]{2}$/`** not `/\.(en|zh)$/`. Works for any locale.
19. **Remove empty interfaces.** When removing `locale` prop, delete the interface if it becomes `{}`.
20. **Hydration: never change DOM tree.** Gate values on `mounted`, not entire subtrees. `useId()` depends on stable tree shape.

## Code Style

### Component Structure

```tsx
'use client';
import React, { useState } from 'react';

interface ComponentProps {
  title: string;
  count?: number;
}

export default function Component({ title, count = 0 }: ComponentProps) {
  return <div>{title}: {count}</div>;
}
```

- Use function declarations, not `React.FC`
- Define props interface above the component
- Export default at declaration site

### TypeScript

- Use `interface` for object shapes, `type` for unions/primitives
- Define component props explicitly
- Avoid `any` — use proper types or `unknown`

### Styling (Tailwind CSS v4)

```tsx
<div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
  <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md">
    Click me
  </button>
</div>
```

### Error Handling

```tsx
try {
  const response = await fetch('/api/data');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  setState(await response.json());
} catch (err) {
  if (process.env.NODE_ENV === 'development') console.error(err);
}
```

## Common Patterns

### Hydration safety

Use `mounted` state to gate client-only values (theme, cookies) — but NEVER return a different DOM tree. Keep the structure identical:

```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => { setMounted(true); }, []);

// Good — same structure, different values
const logoSrc = mounted && resolvedTheme === 'dark'
  ? t('navigation.logoDark')
  : t('navigation.logo');

// Bad — different DOM tree (breaks useId, causes hydration errors)
if (!mounted) return <Skeleton />;
```

### Cleanup pattern

```tsx
useEffect(() => {
  const cleanup = enhanceCodeBlocks({ container: ref.current, labels });
  return cleanup;
}, [html, labels]);
```

## Adding New Features

1. Create files under `src/app/[locale]/` using dynamic routes where appropriate
2. Add all text to `dictionary/en.json` (and zh.json, de.json)
3. Use `next-intl` for all text — `useTranslations` (client) or `getTranslations` (server)
4. Use `localizedPath()` for all internal links
5. Run `npm run lint` and `npm run build` before committing
6. Test in both languages (English/Chinese)
7. Error handling in async functions
8. ESLint passes with no errors
