import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const validator = fileURLToPath(new URL('./validate-marketing-blog.mjs', import.meta.url));
const post = `---
title: 'Example'
date: '2026-09-18'
excerpt: 'Summary'
author: 'Dynamia'
tags: [HAMi]
category: 'Company News'
---

## Hello

A public article.
`;
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j6XcAAAAASUVORK5CYII=', 'base64');
function fixture(run, { existingPost = post, baseFiles = {} } = {}) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'marketing-blog-test-'));
  const git = (...args) => execFileSync('git', args, { cwd, stdio: 'pipe' }).toString().trim();
  const write = (name, data) => { fs.mkdirSync(path.dirname(path.join(cwd, name)), { recursive: true }); fs.writeFileSync(path.join(cwd, name), data); };
  const check = (...extra) => spawnSync(process.execPath, [validator, '--base', base, ...extra], { cwd, encoding: 'utf8' });
  git('init'); git('config', 'user.name', 'Test'); git('config', 'user.email', 'test@example.invalid');
  write('README.md', 'Fixture');
  for (const locale of ['en', 'zh']) write(`dictionary/${locale}.json`, JSON.stringify({ blogUI: { categories: { 'Company News': 'News' } } }));
  write('src/content/blog/existing/zh.md', existingPost);
  write('public/images/blog/existing/cover.png', png);
  for (const [file, data] of Object.entries(baseFiles)) write(file, data);
  git('add', '.'); git('commit', '-m', 'Baseline');
  const base = git('rev-parse', 'HEAD');
  try { run({ cwd, git, write, check }); } finally { fs.rmSync(cwd, { recursive: true, force: true }); }
}
function rejected(result, text) { assert.equal(result.status, 1, result.stdout); assert.match(result.stderr, text); }

test('accepts a new untracked article with local image and fenced HTML example', () => fixture(({ write, check }) => {
  write('src/content/blog/new-post/zh.md', post + '\n![Diagram](/images/blog/new-post/a.png)\n\n```html\n<script>example</script>\n```\n');
  write('public/images/blog/new-post/a.png', png);
  const result = check('--slug', 'new-post'); assert.equal(result.status, 0, result.stderr);
}));
test('rejects unrelated tracked/staged/untracked changes', () => fixture(({ write, check, git }) => {
  write('src/content/blog/existing/zh.md', post + 'Update');
  write('README.md', 'Unrelated'); git('add', 'README.md');
  rejected(check(), /allowlist/);
}));
test('rejects a second post', () => fixture(({ write, check }) => {
  write('src/content/blog/existing/zh.md', post + 'Update');
  write('src/content/blog/other/zh.md', post); rejected(check(), /exactly one/);
}));
for (const [label, addition, error] of [
  ['raw script', '<script>alert(1)</script>', /Raw HTML/],
  ['iframe', '<iframe src="https://example.com"></iframe>', /Raw HTML/],
  ['event handler', '<img src="x" onerror="alert(1)">', /Raw HTML/],
  ['encoded unsafe link', '[open](jav&#x61;script:alert)', /Unsupported link/],
  ['external image', '![image](https://example.com/a.png)', /local asset/],
  ['reference external image', '![image][asset]\n\n[asset]: https://example.com/a.png', /local asset/],
  ['protocol relative link', '[open](//example.com)', /absolute HTTPS/],
]) test(`rejects ${label}`, () => fixture(({ write, check }) => {
  write('src/content/blog/existing/zh.md', post + addition); rejected(check(), error);
}));
test('rejects invalid date', () => fixture(({ write, check }) => {
  write('src/content/blog/existing/zh.md', post.replace('2026-09-18', '2026-02-30')); rejected(check(), /Invalid date/);
}));
test('rejects unregistered categories', () => fixture(({ write, check }) => {
  write('src/content/blog/existing/zh.md', post.replace('Company News', 'Unknown')); rejected(check(), /Unknown category/);
}));
test('rejects unsupported German content', () => fixture(({ write, check }) => {
  write('src/content/blog/existing/de.md', post); rejected(check(), /allowlist/);
}));
test('rejects inert draft fields', () => fixture(({ write, check }) => {
  write('src/content/blog/existing/zh.md', post.replace('title:', 'draft: true\ntitle:')); rejected(check(), /Unsupported frontmatter/);
}));
test('accepts explicit image cover mode', () => fixture(({ write, check }) => {
  write('src/content/blog/existing/zh.md', post.replace('title:', 'coverDisplay: image\ncoverImage: /images/blog/existing/cover.png\ntitle:'));
  const result = check(); assert.equal(result.status, 0, result.stderr);
}));
test('rejects image cover mode without an image', () => fixture(({ write, check }) => {
  write('src/content/blog/existing/zh.md', post.replace('title:', 'coverDisplay: image\ntitle:')); rejected(check(), /requires coverImage/);
}));
test('rejects deletion', () => fixture(({ cwd, check }) => {
  fs.unlinkSync(path.join(cwd, 'src/content/blog/existing/zh.md')); rejected(check(), /Deletion/);
}));
test('rejects a symlink even if its target is a valid image', () => fixture(({ cwd, write, check }) => {
  write('src/content/blog/existing/zh.md', post + '![image](/images/blog/existing/link.png)');
  fs.symlinkSync('cover.png', path.join(cwd, 'public/images/blog/existing/link.png')); rejected(check(), /Symlink/);
}));
test('rejects fake raster files', () => fixture(({ write, check }) => {
  write('src/content/blog/existing/zh.md', post + '![image](/images/blog/existing/fake.png)');
  write('public/images/blog/existing/fake.png', '<svg></svg>'); rejected(check(), /signature/);
}));
test('rejects overwriting shared image filenames', () => fixture(({ write, check }) => {
  write('src/content/blog/existing/zh.md', post + '![image](/images/blog/existing/cover.png)');
  write('public/images/blog/existing/cover.png', Buffer.concat([png, Buffer.from('changed')])); rejected(check(), /new image filename/);
}));
test('checks committed changes relative to base as well', () => fixture(({ write, check, git }) => {
  write('src/content/blog/existing/zh.md', post + '<script>bad</script>');
  git('add', '.'); git('commit', '-m', 'Bad article'); rejected(check(), /Raw HTML/);
}));
test('infrastructure-only PRs can skip the content gate', () => fixture(({ write, check }) => {
  write('README.md', 'Changed docs'); const result = check('--if-content'); assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).skipped, true);
}));

const sharedImage = '/images/blog/older-post/cover.png';
const legacyPost = post.replace('title:', `language: zh\ncoverImage: ${sharedImage}\ntitle:`)
  + `\n![Original diagram](${sharedImage})\n`;
const legacyFixture = { existingPost: legacyPost, baseFiles: { [`public${sharedImage}`]: png } };

test('accepts a sentence edit preserving legacy language and shared cover/body images', () => fixture(({ write, check }) => {
  write('src/content/blog/existing/zh.md', legacyPost.replace('A public article.', 'An updated public article.'));
  const result = check(); assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).images, 1);
}, legacyFixture));
test('accepts a replacement image in the target post directory without rewriting legacy metadata', () => fixture(({ write, check }) => {
  write('src/content/blog/existing/zh.md', legacyPost.replaceAll(sharedImage, '/images/blog/existing/new-cover.png'));
  write('public/images/blog/existing/new-cover.png', png);
  const result = check(); assert.equal(result.status, 0, result.stderr);
}, legacyFixture));
for (const file of ['src/content/blog/existing/zh.md', 'src/content/blog/new-post/zh.md']) {
  test(`rejects introducing a language field in ${file}`, () => fixture(({ write, check }) => {
    write(file, post.replace('title:', 'language: zh\ntitle:')); rejected(check(), /Unsupported frontmatter language/);
  }));
}
test('rejects changing the preserved language marker', () => fixture(({ write, check }) => {
  write('src/content/blog/existing/zh.md', legacyPost.replace('language: zh', 'language: en'));
  rejected(check(), /Unsupported frontmatter language/);
}, legacyFixture));
test('a new translation cannot inherit compatibility exceptions from another locale', () => fixture(({ write, check }) => {
  write('src/content/blog/existing/en.md', legacyPost.replace('language: zh', 'language: en'));
  rejected(check(), /Unsupported frontmatter language/);
}, legacyFixture));
test('rejects changing a legacy cover to a different shared path', () => fixture(({ write, check }) => {
  write('src/content/blog/existing/zh.md', legacyPost.replace(`coverImage: ${sharedImage}`, 'coverImage: /images/blog/other/cover.png'));
  rejected(check(), /local asset/);
}, { ...legacyFixture, baseFiles: { ...legacyFixture.baseFiles, 'public/images/blog/other/cover.png': png } }));
test('a new post cannot inherit another post shared cover', () => fixture(({ write, check }) => {
  write('src/content/blog/new-post/zh.md', post.replace('title:', `coverImage: ${sharedImage}\ntitle:`));
  rejected(check(), /local asset/);
}, legacyFixture));
test('rejects inserting another occurrence of a preserved shared image', () => fixture(({ write, check }) => {
  write('src/content/blog/existing/zh.md', legacyPost + `\n![Additional copy](${sharedImage})\n`);
  rejected(check(), /local asset/);
}, legacyFixture));
test('an unchanged legacy cover does not authorize a new body image reference', () => {
  const coverOnly = legacyPost.replace(`\n![Original diagram](${sharedImage})\n`, '');
  fixture(({ write, check }) => {
    write('src/content/blog/existing/zh.md', legacyPost); rejected(check(), /local asset/);
  }, { ...legacyFixture, existingPost: coverOnly });
});
test('preserves an existing shared reference image when nearby prose changes', () => {
  const referenced = legacyPost.replace(`![Original diagram](${sharedImage})`, `![Original diagram][diagram]\n\n[diagram]: ${sharedImage}`);
  fixture(({ write, check }) => {
    write('src/content/blog/existing/zh.md', referenced.replace('A public article.', 'A corrected public article.'));
    const result = check(); assert.equal(result.status, 0, result.stderr);
  }, { ...legacyFixture, existingPost: referenced });
});
test('a changed reference definition cannot reuse the old shared-image exception', () => {
  const referenced = legacyPost.replace(`![Original diagram](${sharedImage})`, `![Original diagram][diagram]\n\n[diagram]: ${sharedImage}`);
  fixture(({ write, check }) => {
    write('src/content/blog/existing/zh.md', referenced.replace(`[diagram]: ${sharedImage}`, '[diagram]: /images/blog/other/cover.png'));
    rejected(check(), /local asset/);
  }, { ...legacyFixture, existingPost: referenced, baseFiles: { ...legacyFixture.baseFiles, 'public/images/blog/other/cover.png': png } });
});
test('uses the first image reference definition, matching Markdown rendering', () => fixture(({ write, check }) => {
  write('src/content/blog/existing/zh.md', post + '\n![Diagram][diagram]\n\n[diagram]: https://example.com/remote.png\n[diagram]: /images/blog/existing/cover.png\n');
  rejected(check(), /local asset/);
}));
for (const [label, baseline, error] of [
  ['external cover', post.replace('title:', 'coverImage: https://example.com/cover.png\ntitle:'), /local asset/],
  ['external body image', post + '\n![Diagram](https://example.com/image.png)', /local asset/],
  ['raw HTML', post + '\n<script>alert(1)</script>', /Raw HTML/],
  ['unsafe link', post + '\n[Link](javascript:alert)', /Unsupported link/],
  ['unsupported field', post.replace('title:', 'draft: true\ntitle:'), /Unsupported frontmatter/],
]) test(`does not grant a legacy exception for ${label}`, () => fixture(({ write, check }) => {
  write('src/content/blog/existing/zh.md', baseline.replace('A public article.', 'A changed public article.'));
  rejected(check(), error);
}, { existingPost: baseline }));
test('shared legacy raster references still require a valid image file', () => fixture(({ write, check }) => {
  write('src/content/blog/existing/zh.md', legacyPost.replace('A public article.', 'A changed public article.'));
  rejected(check(), /signature/);
}, { ...legacyFixture, baseFiles: { [`public${sharedImage}`]: '<svg></svg>' } }));
