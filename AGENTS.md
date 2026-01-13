# AGENTS.md

This guide helps AI agents work effectively in this Next.js 15 codebase.

## Build & Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint

# Generate Algolia search index
npm run algolia:index
```

**Note:** This project does not currently have test files. Add tests before introducing test coverage.

## Tech Stack

- **Framework:** Next.js 15.2.8 with App Router
- **React:** 19.0.0
- **Language:** TypeScript 5 (strict mode)
- **Styling:** Tailwind CSS v4 (inline theme, no config file)
- **Animations:** Framer Motion
- **i18n:** react-i18next (English/Chinese)
- **Fonts:** Geist Sans & Geist Mono

## Project Structure

```text
src/
├── app/              # Next.js App Router pages
│   ├── layout.tsx     # Root layout with SEO metadata
│   ├── globals.css    # Global styles and CSS variables
│   └── [routes]/      # Page routes
├── components/        # Reusable components
│   ├── layout/        # Layout components (Header, Footer, MainLayout)
│   └── [feature]/     # Feature-specific components
├── i18n/            # Internationalization
│   └── locales/      # Translation files (en.json, zh.json)
├── lib/             # Utility functions
└── types/           # TypeScript interfaces
```

**Path Alias:** `@/*` maps to `./src/*`

## Code Style Guidelines

### Imports

```tsx
// React and core libraries first
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Third-party libraries
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// Internal components
import MainLayout from '@/components/layout/MainLayout';
import GitHubStars from '@/components/GitHubStars';

// Types
import type { BlogPost } from '@/types/blog';
```

### Component Structure

```tsx
'use client'; // Required for client-side features (useState, useEffect, etc.)

import React, { useState } from 'react';

interface ComponentProps {
  title: string;
  count?: number;
}

const Component: React.FC<ComponentProps> = ({ title, count = 0 }) => {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-20 w-40 bg-gray-200 animate-pulse rounded" />;

  return <div>{title}: {count}</div>;
};

export default Component;
```

**Always add `'use client'` directive at the top** for components using hooks or browser APIs.

### TypeScript

- Use `interface` for object shapes, `type` for unions/primitives
- Define component props explicitly
- Use `React.FC<Props>` for functional components
- Avoid `any` - use proper types or `unknown`

```tsx
// Good
interface ButtonProps {
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ onClick, variant = 'primary' }) => {
  // ...
};

// Bad
const Button = ({ onClick, variant }: any) => {
  // ...
};
```

### Naming Conventions

- **Components:** PascalCase (`MainLayout`, `GitHubStars`)
- **Functions:** camelCase (`formatNumber`, `handleClick`)
- **Constants:** UPPER_SNAKE_CASE (`API_ENDPOINT`, `MAX_RETRIES`)
- **Types/Interfaces:** PascalCase, descriptive names (`BlogPost`, `TocItem`)
- **Files:** PascalCase for components, camelCase for utilities

### State Management

- Use `useState` for local component state
- Use `useEffect` for side effects, always cleanup
- Use `useRef` for DOM refs and persisting values across renders
- Avoid global state unless necessary

```tsx
// Good pattern for refs with cleanup
const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

useEffect(() => {
  return () => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
  };
}, []);
```

### Error Handling

```tsx
// API calls with error handling
const fetchData = async () => {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Request failed: ${response.status}`);
      }
      return;
    }
    const data = await response.json();
    setState(data);
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Fetch error:', err);
    }
  }
};
```

**Always check for `response.ok` before parsing JSON.**

### Styling (Tailwind CSS v4)

- Use utility classes, no CSS modules needed
- Custom colors defined in `globals.css`:
  - `--primary`: #0FD05D (green)
  - `--primary-dark`: #0CAB4D
  - `--primary-light`: rgba(15, 208, 93, 0.1)
- Use custom color classes: `bg-primary`, `text-primary`, `border-primary`
- Responsive: `sm:`, `md:`, `lg:` breakpoints
- Dark mode supported via `prefers-color-scheme`

```tsx
// Example usage
<div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-300">
  <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md">
    Click me
  </button>
</div>
```

### Internationalization (i18n)

**CRITICAL:** i18n (react-i18next) can ONLY be used in client components.

```tsx
'use client';

import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('home.hero.title')}</h1>
      <p>{t('navigation.freeTrial')}</p>
    </div>
  );
};
```

**Language files:**

- `src/i18n/locales/en.json` - English translations
- `src/i18n/locales/zh.json` - Chinese translations

**Language switching:**

- English is default (root path `/`)
- Chinese uses `/zh` prefix
- Current locale determined by path starting with `/zh`

### Images & Assets

```tsx
import Image from 'next/image';

<Image
  src="/images/logo.svg"
  alt="Logo"
  width={200}
  height={100}
  priority  // For above-the-fold images
  unoptimized  // For animated GIFs
  className="rounded-lg"
/>
```

- Always provide `alt` text
- Use `priority` for LCP images
- Use `unoptimized` for GIFs
- Images stored in `public/` directory

### SEO & Metadata

SEO is configured in `src/app/layout.tsx`. When adding pages:

```tsx
export const metadata: Metadata = {
  title: 'Page Title | Dynamia AI',
  description: 'Page description for SEO',
  openGraph: {
    title: 'Page Title',
    description: 'Page description',
    images: ['/og-image.png'],
  },
};
```

### Animation (Framer Motion)

```tsx
import { motion } from 'framer-motion';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

<motion.div
  initial="hidden"
  animate="visible"
  variants={fadeIn}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

Define animation variants at component top level for reusability.

### ESLint Rules

- `@typescript-eslint/no-explicit-any: off` - `any` allowed but prefer proper types
- Follow Next.js TypeScript rules
- Run `npm run lint` before committing

## Common Patterns

### Mounted State Pattern (Prevent Hydration Errors)

```tsx
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) return <Placeholder />;
```

### Conditional Rendering with Language

```tsx
const currentLocale = pathname?.startsWith('/zh') ? 'zh' : 'en';

<Link href={currentLocale === 'zh' ? '/zh/products' : '/products'}>
  {t('navigation.products')}
</Link>
```

### Cleanup Pattern for Side Effects

```tsx
useEffect(() => {
  const cleanup = () => {
    // Cleanup logic
  };

  // Setup logic

  return cleanup;
}, [dependencies]);
```

## Important Constraints

1. **Never use i18n in server components** - All components with `useTranslation()` must have `'use client'`
2. **Always check for hydration errors** - Use mounted state pattern for browser-specific code
3. **Don't suppress TypeScript errors** - Use proper types instead of `as any`
4. **Test in both languages** - Check English and Chinese versions when adding content
5. **Keep components focused** - Single responsibility principle
6. **Use path alias `@/*`** - Don't use relative paths for internal imports

## Adding New Features

1. Create component file in appropriate directory
2. Define TypeScript interface for props
3. Add `'use client'` if using hooks or browser APIs
4. Implement with Tailwind classes for styling
5. Add translations to both `en.json` and `zh.json`
6. Import and use in page or parent component
7. Run `npm run lint` to check for issues
8. Test in both languages (English/Chinese)

## File Creation Checklist

- [ ] Component uses `'use client'` if needed
- [ ] TypeScript props interface defined
- [ ] All imports follow order convention
- [ ] Tailwind classes used for styling
- [ ] Error handling in async functions
- [ ] Cleanup in useEffect where needed
- [ ] Mounted state pattern for browser code
- [ ] Translations added to both locale files
- [ ] ESLint passes with no errors
- [ ] Works in both English and Chinese
