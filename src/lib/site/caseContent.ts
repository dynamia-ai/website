import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import {contentLocaleCandidates} from '@/lib/site/localeFallback';

export interface CaseOutcome {
  value: string;
  label: string;
  detail: string;
}

export interface CaseSection {
  id: string;
  title: string;
}

export interface CaseDocument {
  slug: string;
  locale: string;
  title: string;
  company: string;
  companyName: string;
  logo: string;
  date: string;
  dateLabel: string;
  sourceKind: string;
  sourceUrl: string;
  sourceLinkLabel: string;
  outcomeSourceUrl: string;
  outcomeSourceLabel: string;
  outcomes: CaseOutcome[];
  sections: CaseSection[];
  bodyMarkdown: string;
}

const CONTENT_PATH = path.join(process.cwd(), 'src/content/cases');

export function caseContentSlug(slug: string): string {
  if (slug === 'ke-holdings') return 'ke-holdings-inc';
  return slug;
}

export function getCaseSlugs(): string[] {
  if (!fs.existsSync(CONTENT_PATH)) return [];
  return fs
    .readdirSync(CONTENT_PATH, {withFileTypes: true})
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

export function getCaseDocument(slug: string, locale: string): CaseDocument | null {
  const contentSlug = caseContentSlug(slug);
  const candidates = contentLocaleCandidates(locale);
  for (const lang of candidates) {
    const fullPath = path.join(CONTENT_PATH, contentSlug, `${lang}.md`);
    if (!fs.existsSync(fullPath)) continue;
    const raw = fs.readFileSync(fullPath, 'utf8');
    const {data, content} = matter(raw);
    return {
      slug: contentSlug,
      locale: lang,
      title: String(data.title || ''),
      company: String(data.company || contentSlug),
      companyName: String(data.companyName || data.company || contentSlug),
      logo: String(data.logo || ''),
      date: String(data.date || ''),
      dateLabel: String(data.dateLabel || data.date || ''),
      sourceKind: String(data.sourceKind || ''),
      sourceUrl: String(data.sourceUrl || ''),
      sourceLinkLabel: String(data.sourceLinkLabel || ''),
      outcomeSourceUrl: String(data.outcomeSourceUrl || ''),
      outcomeSourceLabel: String(data.outcomeSourceLabel || ''),
      outcomes: Array.isArray(data.outcomes) ? (data.outcomes as CaseOutcome[]) : [],
      sections: Array.isArray(data.sections) ? (data.sections as CaseSection[]) : [],
      bodyMarkdown: content.trim(),
    };
  }
  return null;
}
