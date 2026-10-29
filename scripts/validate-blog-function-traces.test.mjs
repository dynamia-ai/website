import test from 'node:test';
import assert from 'node:assert/strict';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateBlogFunctionTraces } from './validate-blog-function-traces.mjs';

const listTrace = '.next/server/app/[locale]/blog/page.js.nft.json';
const detailTrace = '.next/server/app/[locale]/blog/[slug]/page.js.nft.json';
const resourceTrace = '.next/server/app/[locale]/resources/page.js.nft.json';

function fixture(t) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'server-traces-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

function writeTrace(root, name, dependencies = []) {
  const trace = path.join(root, name);
  mkdirSync(path.dirname(trace), { recursive: true });
  const files = dependencies.map((file) => path.relative(path.dirname(trace), path.join(root, file)));
  writeFileSync(trace, JSON.stringify({ version: 1, files }));
}

function writeRequiredTraces(root) {
  writeTrace(root, listTrace);
  writeTrace(root, detailTrace);
}

test('checks nested server traces without mistaking public-like directory names for public', (t) => {
  const root = fixture(t);
  writeRequiredTraces(root);
  writeTrace(root, resourceTrace, ['public-archive/cover.png', 'src/content/blog/example/zh.md']);
  writeTrace(root, '.next/server/app/api/enterprise-install/route.js.nft.json', ['node_modules/example/index.js']);
  assert.equal(validateBlogFunctionTraces(root), 4);
});

test('rejects public assets in a non-blog route, including normalized paths', (t) => {
  const root = fixture(t);
  writeRequiredTraces(root);
  writeTrace(root, resourceTrace, ['public/images/cover.png']);
  const trace = path.join(root, resourceTrace);
  const relative = path.relative(path.dirname(trace), path.join(root, 'public/images/cover.png'));
  writeFileSync(trace, JSON.stringify({ files: [relative.replace('images', 'images/old/..')] }));
  assert.throws(() => validateBlogFunctionTraces(root), /resources.*bundles 1 public assets/);
});

test('fails when the build output is missing or has no server traces', (t) => {
  const root = fixture(t);
  assert.throws(() => validateBlogFunctionTraces(root), { code: 'ENOENT' });
  mkdirSync(path.join(root, '.next/server'), { recursive: true });
  assert.throws(() => validateBlogFunctionTraces(root), /No server function traces found/);
});

test('requires both blog traces even when other routes were built', (t) => {
  const root = fixture(t);
  writeTrace(root, resourceTrace);
  assert.throws(() => validateBlogFunctionTraces(root), /Missing required build trace/);
  writeTrace(root, listTrace);
  assert.throws(() => validateBlogFunctionTraces(root), /Missing required build trace:.*\[slug\]/);
});

test('rejects malformed JSON and invalid file lists instead of silently passing', (t) => {
  const root = fixture(t);
  writeRequiredTraces(root);
  writeTrace(root, resourceTrace);
  const trace = path.join(root, resourceTrace);
  writeFileSync(trace, '{');
  assert.throws(() => validateBlogFunctionTraces(root), /Cannot read build trace:.*resources/);
  for (const data of [null, {}, { files: 'cover.png' }, { files: [42] }, { files: [''] }]) {
    writeFileSync(trace, JSON.stringify(data));
    assert.throws(() => validateBlogFunctionTraces(root), /Invalid file list in build trace:.*resources/);
  }
});

test('CLI checks its own project from another working directory and exits nonzero on a violation', (t) => {
  const root = fixture(t);
  writeRequiredTraces(root);
  const script = path.join(root, 'scripts/validate-blog-function-traces.mjs');
  mkdirSync(path.dirname(script), { recursive: true });
  copyFileSync(fileURLToPath(new URL('./validate-blog-function-traces.mjs', import.meta.url)), script);
  const run = () => spawnSync(process.execPath, [script], { cwd: os.tmpdir(), encoding: 'utf8' });
  const success = run();
  assert.equal(success.status, 0, success.stderr);
  assert.match(success.stdout, /PASS 2 server function traces/);
  writeTrace(root, resourceTrace, ['public/cover.png']);
  const failure = run();
  assert.notEqual(failure.status, 0);
  assert.match(failure.stderr, /resources.*bundles 1 public assets/);
});
