import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { collectPublicAssetPaths, writePublicAssetManifest } from './public-assets.mjs';
import { selectPostSocialImage } from '../src/lib/blog-social-image.ts';

test('manifest is generated from current files without copying their contents', (t) => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'public-assets-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(path.join(root, 'public/images/empty'), { recursive: true });
  writeFileSync(path.join(root, 'public/images/cover.png'), 'image bytes are not a dependency');
  writeFileSync(path.join(root, 'public/favicon.ico'), 'icon bytes');
  const output = path.join(root, 'src/generated/public-asset-paths.json');
  writePublicAssetManifest(root);
  assert.deepEqual(JSON.parse(readFileSync(output, 'utf8')), ['/favicon.ico', '/images/cover.png']);
  const modified = statSync(output).mtimeMs;
  writePublicAssetManifest(root);
  assert.equal(statSync(output).mtimeMs, modified, 'unchanged manifests must not trigger dev rebuilds');
  rmSync(path.join(root, 'public/images/cover.png'));
  writeFileSync(path.join(root, 'public/images/new.png'), 'new image');
  writePublicAssetManifest(root);
  assert.deepEqual(JSON.parse(readFileSync(output, 'utf8')), ['/favicon.ico', '/images/new.png']);
  assert.deepEqual(collectPublicAssetPaths(path.join(root, 'public')), ['/favicon.ico', '/images/new.png']);
});

const assets = new Set(['/images/cover.png', '/images/first.png', '/images/second.png']);
const content = '![First](/images/first.png "Caption")\n![Second](/images/second.png)';
test('an existing cover takes precedence over the first body image', () => {
  assert.equal(selectPostSocialImage({ coverImage: '/images/cover.png', content }, assets), '/images/cover.png');
});
test('missing and external covers fall back to the first local image', () => {
  for (const coverImage of ['/images/missing.png', 'https://example.com/cover.png', undefined]) {
    assert.equal(selectPostSocialImage({ coverImage, content }, assets), '/images/first.png');
  }
});
test('missing first image and text-only posts preserve the existing no-image fallback', () => {
  assert.equal(selectPostSocialImage({ content: 'Only text' }, assets), undefined);
  assert.equal(selectPostSocialImage({ content: '![Missing](/missing.png)\n' + content }, assets), undefined);
});
test('path lookup retains normalization without treating query strings as local files', () => {
  assert.equal(selectPostSocialImage({ coverImage: '/images/old/../cover.png', content: '' }, assets), '/images/old/../cover.png');
  for (const coverImage of ['/images/cover.png?version=1', '/images/cover.png#fragment', 'images/cover.png']) {
    assert.equal(selectPostSocialImage({ coverImage, content: '' }, assets), undefined);
  }
});
