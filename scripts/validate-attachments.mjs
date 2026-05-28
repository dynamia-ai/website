#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ATTACHMENTS_DIR = path.join(__dirname, '..', 'src', 'content', 'attachments');
const REQUIRED = ['hami-helm-values.md', 'kantaloupe-helm-values.md'];
const REQUIRED_FIELDS = ['title', 'slug', 'description', 'productId', 'lastUpdated'];
const allowedProducts = new Set(['hami-enterprise', 'hami-ai-platform']);
const errors = [];

if (!fs.existsSync(ATTACHMENTS_DIR)) {
  errors.push('attachments directory is missing');
} else {
  const files = fs.readdirSync(ATTACHMENTS_DIR).filter((file) => file.endsWith('.md'));
  for (const requiredFile of REQUIRED) {
    if (!files.includes(requiredFile)) {
      errors.push(`missing attachment file: ${requiredFile}`);
    }
  }

  for (const file of files) {
    const fullPath = path.join(ATTACHMENTS_DIR, file);
    const raw = fs.readFileSync(fullPath, 'utf-8');
    const { data, content } = matter(raw);

    for (const field of REQUIRED_FIELDS) {
      if (typeof data[field] !== 'string' || data[field].trim() === '') {
        errors.push(`${file}: missing frontmatter field "${field}"`);
      }
    }

    const expectedSlug = file.replace(/\.md$/, '');
    if (data.slug !== expectedSlug) {
      errors.push(`${file}: slug must equal "${expectedSlug}"`);
    }

    if (!allowedProducts.has(data.productId)) {
      errors.push(`${file}: unsupported productId "${data.productId}"`);
    }

    if (!content.includes('## Values')) {
      errors.push(`${file}: expected helm-docs content with a "## Values" section`);
    }
  }
}

if (errors.length > 0) {
  console.error('attachment validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('attachment markdown passes validation');
