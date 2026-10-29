import test from 'node:test';
import assert from 'node:assert/strict';
import { copyFileSync, existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
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

test('the standalone generator initializes its own project when called from another directory', (t) => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'public-assets-cli-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(path.join(root, 'project/scripts'), { recursive: true });
  mkdirSync(path.join(root, 'project/public'));
  mkdirSync(path.join(root, 'caller'));
  const script = path.join(root, 'project/scripts/public-assets.mjs');
  copyFileSync(new URL('./public-assets.mjs', import.meta.url), script);
  writeFileSync(path.join(root, 'project/public/cover.png'), 'cover');
  const imported = spawnSync(process.execPath, ['--input-type=module', '-'], {
    cwd: path.join(root, 'caller'), encoding: 'utf8',
    input: `await import(${JSON.stringify(pathToFileURL(script).href)});`,
  });
  assert.equal(imported.status, 0, imported.stderr);
  assert.equal(existsSync(path.join(root, 'caller/src')), false);
  assert.equal(existsSync(path.join(root, 'project/src')), false);
  const result = spawnSync(process.execPath, [script], { cwd: path.join(root, 'caller'), encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(readFileSync(path.join(root, 'project/src/generated/public-asset-paths.json'), 'utf8')), ['/cover.png']);
  assert.equal(existsSync(path.join(root, 'caller/src')), false);
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
