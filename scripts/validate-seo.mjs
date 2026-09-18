import assert from 'node:assert/strict';
import fs from 'node:fs';
import matter from 'gray-matter';

const base = process.env.SEO_TEST_URL || 'http://localhost:3100';
const site = 'https://dynamia.ai';
let checks = 0;
function check(value, message) { assert.ok(value, message); checks++; }
function attrs(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((m) => [m[1], m[2].replaceAll('&amp;', '&')]));
}
function tags(html, name) { return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'g'))].map((m) => attrs(m[0])); }
function canonical(html) { return tags(html, 'link').find((t) => t.rel === 'canonical')?.href; }
function articles(html) { return tags(html, 'a').map((a) => a.href).filter((h) => /^\/(zh\/)?blog\/[^/?#]+$/.test(h || '')); }
async function get(path) {
  const response = await fetch(new URL(path, base), { redirect: 'manual', headers: { 'User-Agent': 'Googlebot' } });
  return { response, html: await response.text() };
}
async function page(path) {
  const result = await get(path);
  check(result.response.status === 200, `${path}: expected 200, got ${result.response.status}`);
  return result.html;
}

for (const prefix of ['', '/zh']) {
  const first = await page(`${prefix}/blog`);
  const second = await page(`${prefix}/blog?page=2`);
  check(canonical(second) === `${site}${prefix}/blog?page=2`, 'Page 2 must have its own canonical');
  check(articles(first).length === 9 && articles(second).length === 9, 'Both pages must SSR nine article links');
  check(articles(second).every((url) => !articles(first).includes(url)), 'Page 2 must SSR different articles');
  check(tags(second, 'link').filter((t) => t.hreflang).every((t) => t.href.endsWith('?page=2')), 'hreflang must preserve pagination');
  check(tags(second, 'a').some((t) => t.href === `${prefix}/blog`), 'Previous link must return to the canonical first page');
  for (const value of ['1', '0', '-1', 'NaN', '2oops', '99999']) {
    const { response } = await get(`${prefix}/blog?page=${value}`);
    check(response.status === 308, `Invalid/redundant page ${value} must redirect`);
    const target = new URL(response.headers.get('location'), base);
    check(target.pathname === `${prefix}/blog`, 'Page normalization must preserve locale');
  }
}

const englishPosts = fs.readdirSync('src/content/blog').flatMap((slug) => {
  const path = `src/content/blog/${slug}/en.md`;
  return slug !== 'hello-world' && fs.existsSync(path) ? [{ slug, ...matter(fs.readFileSync(path, 'utf8')).data }] : [];
});
const category = englishPosts.find((p) => englishPosts.filter((x) => x.category === p.category).length > 9).category;
const filtered = await page(`/blog?page=2&category=${encodeURIComponent(category)}`);
check(tags(filtered, 'meta').some((t) => t.name === 'robots' && t.content.includes('noindex')), 'Filtered lists must be noindex');
check(articles(filtered).every((url) => englishPosts.find((p) => `/blog/${p.slug}` === url)?.category === category), 'Category page must SSR only matching articles');
check(tags(filtered, 'a').some((t) => t.href?.startsWith('/blog?category=')), 'Pagination must retain selected category');

const aliases = {
  'HAMi-Koordinator-v1.6': 'hami-koordinator-v1.6',
  'HAMi-v.2.5.0-Released': 'hami-v.2.5.0-released',
  'open-source-vgpu-spread-Binpack': 'open-source-vgpu-spread-binpack',
  'demystifying-the-Reservation-Pod': 'demystifying-the-reservation-pod',
  'prep-EDU-HAMi': 'prep-edu-hami',
  'open-source-vgpu-hami-device-plugin-nvidia-analysis': 'open-source-vgpu-hami-device-plugin-nvidia',
  'open-source-vgpu-hami-core(libvgpu.so)vCUDA': 'open-source-vgpu-hami-core-libvgpu-so-vcuda',
};
for (const prefix of ['', '/en', '/zh', '/de']) {
  for (const [oldSlug, newSlug] of Object.entries(aliases)) {
    const { response } = await get(`${prefix}/blog/${encodeURIComponent(oldSlug)}?utm_source=test`);
    const target = new URL(response.headers.get('location'), base);
    check(response.status === 308, `${oldSlug} must redirect permanently`);
    check(target.pathname === `${prefix === '/en' ? '' : prefix}/blog/${newSlug}`, 'Redirect must preserve locale and reach equivalent article');
    check(target.search === '?utm_source=test', 'Redirect must preserve query');
    const current = await get(target.pathname);
    check(current.response.status === 200, 'Canonical destination must not redirect back');
  }
}

for (const prefix of ['', '/zh', '/de']) {
  for (const path of ['/resources', '/solutions', '/case-studies/telecom']) {
    const html = await page(prefix + path);
    check(!tags(html, 'a').some((a) => /\/resources\/(blog|whitepapers|documentation)|\/contact(?:$|\?)|\/solutions\//.test(a.href || '')), `${path} must not expose obsolete links`);
  }
  const legacy = await get(`${prefix}/resources/blog`);
  check(legacy.response.status === 308 && new URL(legacy.response.headers.get('location'), base).pathname === `${prefix}/blog`, 'Legacy resource blog route must retain locale');
}

const slug = 'dynamia-metax-llm-d-integration';
for (const prefix of ['', '/zh']) {
  const html = await page(`${prefix}/blog/${slug}`);
  const scripts = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  const article = scripts.find((d) => d['@type'] === 'Article');
  check(article?.url === canonical(html) && article.mainEntityOfPage['@id'] === canonical(html), 'Article URL must match canonical');
  if (prefix) check(article.headline.includes('密瓜智能'), 'Chinese page must use Chinese Article headline');
}
const prep = await page('/blog/prep-edu-hami');
check(/<title>[^<]*PREP EDU/.test(prep) && /<h1\b[^>]*>[^<]*PREP EDU/.test(prep), 'PREP EDU must have a real title and H1');
for (const path of ['/seo-regression-missing', '/blog/seo-regression-missing', '/products/seo-regression-missing']) {
  const { response, html } = await get(path);
  check(response.status === 404 && html.includes('noindex'), 'Unknown URLs must remain real 404s');
}
const sitemap = await page('/sitemap.xml');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
check(new Set(sitemapUrls).size === sitemapUrls.length, 'Sitemap must not duplicate canonical URLs');
check(englishPosts.every((post) => sitemapUrls.includes(`${site}/blog/${post.slug}`)), 'Sitemap must retain every published English article');
const homeEntry = sitemap.match(/<url>\s*<loc>https:\/\/dynamia.ai\/<\/loc>[\s\S]*?<\/url>/)?.[0];
check(homeEntry && !homeEntry.includes('<lastmod>'), 'Static lastmod must not be generated from deployment time');
console.log(`SEO regression checks passed: ${checks}`);
