# Dynamia AI Website

Official website for Dynamia AI, built with Next.js 15.

## Tech Stack

- **Framework:** Next.js 15.2.8 with App Router
- **React:** 19.0.0
- **Language:** TypeScript 5 (strict mode)
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **i18n:** react-i18next (English/Chinese)
- **Fonts:** Geist Sans & Geist Mono

## Getting Started

### Prerequisites

- Node.js 20+
- npm, yarn, pnpm, or bun

### Installation

```bash
# Install dependencies
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Available Scripts

```bash
# Development
npm run dev              # Start development server

# Building
npm run build            # Production build
npm run build-legacy     # Production build with increased memory (if needed)

# Production
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint

# Search
npm run algolia:index    # Generate Algolia search index
```

## Project Structure

```text
src/
├── app/              # Next.js App Router pages
├── components/       # Reusable React components
├── i18n/            # Internationalization (en.json, zh.json)
├── lib/             # Utility functions
└── types/           # TypeScript type definitions
```

**Path Alias:** `@/*` maps to `./src/*`

## Deployment

The easiest way to deploy is using [Vercel](https://vercel.com/).

Check the [Next.js deployment documentation](https://nextjs.org/docs/app/getting-started/deploying) for more details.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js GitHub Repository](https://github.com/vercel/next.js)
- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4-alpha)

## Development Guidelines

This project follows specific coding standards. See [AGENTS.md](./AGENTS.md) for:

- Component structure patterns
- Import conventions
- TypeScript best practices
- Styling guidelines
- i18n usage rules
