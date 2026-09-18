#!/usr/bin/env node
// Content-only publishing gate; run from the repository root.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' });
const fail = message => { throw new Error(message); };
const slugPattern = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;
const fields = new Set(['title', 'linktitle', 'date', 'excerpt', 'author', 'tags', 'category', 'coverImage', 'coverTitle', 'coverDisplay']);

function regularFile(file) {
  let current = process.cwd();
  for (const part of file.split('/')) {
    current = path.join(current, part);
    if (fs.lstatSync(current).isSymbolicLink()) fail(`Symlink is not allowed: ${file}`);
  }
  if (!fs.statSync(file).isFile()) fail(`Not a regular file: ${file}`);
}

function imageFile(file) {
  regularFile(file);
  const data = fs.readFileSync(file);
  if (data.length > 10 * 1024 * 1024) fail(`Image exceeds 10 MiB: ${file}`);
  const ext = path.extname(file).toLowerCase();
  const valid = (ext === '.png' && data.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')))
    || (['.jpg', '.jpeg'].includes(ext) && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff)
    || (ext === '.gif' && /^GIF8[79]a$/.test(data.subarray(0, 6).toString()))
    || (ext === '.webp' && data.subarray(0, 4).toString() === 'RIFF' && data.subarray(8, 12).toString() === 'WEBP');
  if (!valid) fail(`Image extension/signature mismatch: ${file}`);
}

function localImage(url, slug, images) {
  const prefix = `/images/blog/${slug}/`;
  if (!url.startsWith(prefix) || !/^[a-zA-Z0-9._-]+\.(png|jpe?g|webp|gif)$/i.test(url.slice(prefix.length))) {
    fail(`Image must use this post's local asset directory: ${url}`);
  }
  const file = `public${url}`;
  imageFile(file);
  images.add(file);
}

function safeLink(url) {
  if (/[\u0000-\u0020\u007f\\]/.test(url)) fail(`Invalid link: ${url}`);
  if (url.startsWith('#')) return;
  if (url.startsWith('/') && !url.startsWith('//')) return;
  let parsed;
  try { parsed = new URL(url); } catch { fail(`Use an absolute HTTPS or site-relative link: ${url}`); }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) fail(`Unsupported link: ${url}`);
}

function validatePost(file, slug, images) {
  regularFile(file);
  const raw = fs.readFileSync(file, 'utf8');
  if (!raw.startsWith('---\n') && !raw.startsWith('---\r\n')) fail(`Missing frontmatter: ${file}`);
  const { data, content } = matter(raw);
  for (const key of Object.keys(data)) if (!fields.has(key)) fail(`Unsupported frontmatter ${key}: ${file}`);
  for (const key of ['title', 'date', 'excerpt', 'author', 'category']) {
    if (typeof data[key] !== 'string' || !data[key].trim()) fail(`Missing/non-string ${key}: ${file}`);
  }
  for (const locale of ['en', 'zh']) {
    const dictionary = JSON.parse(fs.readFileSync(`dictionary/${locale}.json`, 'utf8'));
    if (!Object.hasOwn(dictionary.blogUI.categories, data.category)) fail(`Unknown category: ${data.category}`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)
      || !Number.isFinite(Date.parse(`${data.date}T00:00:00Z`))
      || new Date(`${data.date}T00:00:00Z`).toISOString().slice(0, 10) !== data.date) fail(`Invalid date: ${file}`);
  if (!Array.isArray(data.tags) || !data.tags.length || data.tags.some(t => typeof t !== 'string' || !t.trim())) fail(`Invalid tags: ${file}`);
  for (const key of ['linktitle', 'coverTitle']) {
    if (data[key] !== undefined && (typeof data[key] !== 'string' || !data[key].trim())) fail(`Invalid ${key}: ${file}`);
  }
  if (data.coverImage !== undefined) {
    if (typeof data.coverImage !== 'string') fail(`Invalid coverImage: ${file}`);
    localImage(data.coverImage, slug, images);
  }
  if (data.coverDisplay !== undefined && !['image', 'text'].includes(data.coverDisplay)) fail(`Invalid coverDisplay: ${file}`);
  if (data.coverDisplay === 'image' && !data.coverImage) fail(`Image cover requires coverImage: ${file}`);
  if (!content.trim()) fail(`Empty body: ${file}`);
  const ast = unified().use(remarkParse).use(remarkGfm).parse(content);
  const definitions = new Map();
  function collect(node) {
    if (node.type === 'definition') definitions.set(node.identifier, node.url);
    for (const child of node.children || []) collect(child);
  }
  collect(ast);
  function walk(node) {
    if (node.type === 'html') fail(`Raw HTML is not allowed: ${file}`);
    if (node.type === 'heading' && node.depth === 1) fail(`Body headings must start at H2: ${file}`);
    if (node.type === 'image' || node.type === 'imageReference') {
      if (!node.alt?.trim()) fail(`Image needs alternative text: ${file}`);
      const url = node.type === 'image' ? node.url : definitions.get(node.identifier);
      if (!url) fail(`Missing image reference: ${file}`);
      localImage(url, slug, images);
    }
    if (node.type === 'link' || node.type === 'definition') safeLink(node.url);
    for (const child of node.children || []) walk(child);
  }
  walk(ast);
}

export function validate({ base, slug, ifContent = false }) {
  if (!base || base.startsWith('-')) fail('Provide --base <trusted base SHA/ref>');
  const baseSHA = git('rev-parse', '--verify', `${base}^{commit}`).trim();
  const status = git('diff', '--name-status', '--no-renames', '-z', baseSHA).split('\0').filter(Boolean);
  const changes = [];
  for (let i = 0; i < status.length; i += 2) changes.push({ status: status[i], file: status[i + 1] });
  for (const file of git('ls-files', '--others', '--exclude-standard', '-z').split('\0').filter(Boolean)) changes.push({ status: 'A', file });
  const relevant = changes.filter(({ file }) => file.startsWith('src/content/blog/') || file.startsWith('public/images/blog/'));
  if (!relevant.length && ifContent) return { skipped: true, reason: 'No blog content changed' };
  if (!relevant.length) fail('No blog changes found');
  const slugs = new Set(relevant.map(({ file }) => file.split('/')[3]));
  if (slugs.size !== 1) fail('A marketing PR must change exactly one post');
  const target = [...slugs][0];
  if (!slugPattern.test(target) || target === '.' || target === '..' || (slug && target !== slug)) fail(`Invalid/unexpected slug: ${target}`);
  const exists = git('ls-tree', '--name-only', baseSHA, `src/content/blog/${target}/`).trim();
  if (!exists && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(target)) fail('New slugs must use lowercase letters, digits and hyphens');
  const prefix = `src/content/blog/${target}/`;
  const imagePrefix = `public/images/blog/${target}/`;
  const posts = [];
  const changedImages = [];
  for (const { status, file } of changes) {
    if (!['A', 'M'].includes(status)) fail(`Deletion, rename or type change is not allowed: ${file}`);
    if (file.startsWith(prefix) && /^(zh|en)\.md$/.test(file.slice(prefix.length))) posts.push(file);
    else if (file.startsWith(imagePrefix) && /^[a-zA-Z0-9._-]+\.(png|jpe?g|webp|gif)$/i.test(file.slice(imagePrefix.length))) {
      // Existing assets can be shared by old posts/locales: always add a new filename.
      if (status !== 'A') fail(`Use a new image filename instead of overwriting: ${file}`);
      changedImages.push(file);
    } else fail(`Outside the content-only allowlist: ${file}`);
  }
  if (!posts.length) fail('Image changes must accompany a Markdown post update');
  const images = new Set();
  for (const file of posts) validatePost(file, target, images);
  for (const file of changedImages) if (!images.has(file)) fail(`Unreferenced new image: ${file}`);
  const size = [...images].reduce((total, file) => total + fs.statSync(file).size, 0);
  if (size > 40 * 1024 * 1024) fail('Referenced images exceed 40 MiB');
  return { slug: target, posts, images: images.size, base: baseSHA };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    const options = {};
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--if-content') options.ifContent = true;
      else if (['--base', '--slug'].includes(args[i]) && args[i + 1]) options[args[i].slice(2)] = args[++i];
      else fail(`Unknown/incomplete argument: ${args[i]}`);
    }
    console.log(JSON.stringify(validate(options), null, 2));
  } catch (error) {
    console.error(`Marketing blog validation failed: ${error.message}`);
    process.exitCode = 1;
  }
}
