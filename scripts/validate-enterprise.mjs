#!/usr/bin/env node
/**
 * Validate src/data/enterprise-products.json before release.
 * Blocks "TBD" sha256, missing required fields, and unreachable URLs (HEAD probe).
 *
 * Usage:
 *   node scripts/validate-enterprise.mjs            # schema-only
 *   node scripts/validate-enterprise.mjs --probe    # also HEAD-probe URLs
 *   node scripts/validate-enterprise.mjs --strict   # treat warnings as errors
 *
 * Exit codes:
 *   0 — pass
 *   1 — error (release blocker)
 *   2 — warnings only with --strict
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '..', 'src', 'data', 'enterprise-products.json');

const args = new Set(process.argv.slice(2));
const PROBE = args.has('--probe');
const STRICT = args.has('--strict');

const errors = [];
const warnings = [];

function err(msg) {
  errors.push(msg);
}
function warn(msg) {
  warnings.push(msg);
}

function isI18n(o) {
  return o && typeof o === 'object' && typeof o.en === 'string' && typeof o.zh === 'string';
}

const raw = fs.readFileSync(DATA_FILE, 'utf-8');
const data = JSON.parse(raw);

if (!Array.isArray(data.products)) {
  err('products[] missing or not an array');
} else {
  for (const p of data.products) {
    const id = p.id ?? '<unknown>';
    if (!p.id) err(`product missing id`);
    if (!isI18n(p.name)) err(`${id}: name must be {en,zh}`);
    if (!isI18n(p.tagline)) err(`${id}: tagline must be {en,zh}`);
    if (!Array.isArray(p.releases) || p.releases.length === 0)
      err(`${id}: releases[] missing or empty`);

    for (const r of p.releases ?? []) {
      const tag = `${id}@${r.version ?? '<no-version>'}`;
      if (!r.version) err(`${tag}: version missing`);
      if (!r.releasedAt) err(`${tag}: releasedAt missing`);
      if (!Array.isArray(r.artifacts) || r.artifacts.length === 0)
        err(`${tag}: artifacts[] missing or empty`);

      for (const a of r.artifacts ?? []) {
        const aTag = `${tag} [${a.type}/${a.arch ?? 'n/a'}]`;
        if (!a.type) err(`${aTag}: type missing`);
        if (!isI18n(a.label)) err(`${aTag}: label must be {en,zh}`);
        if (!a.url) err(`${aTag}: url missing`);

        // sha256 required for downloadable binary artifacts
        const isBinary =
          a.type === 'image-bundle' ||
          a.type === 'helm-chart' ||
          a.type === 'airgap-bundle';
        if (isBinary) {
          if (!a.sha256) err(`${aTag}: sha256 required for ${a.type}`);
          else if (a.sha256 === 'TBD') err(`${aTag}: sha256 is "TBD" — release blocked`);
          else if (!/^[a-f0-9]{64}$/i.test(a.sha256))
            warn(`${aTag}: sha256 not a 64-hex string (got ${a.sha256.slice(0, 16)}…)`);
        }

        // mirrors integrity
        if (Array.isArray(a.mirrors)) {
          for (const m of a.mirrors) {
            if (!m.region) err(`${aTag}: mirror missing region`);
            if (!isI18n(m.label)) err(`${aTag}: mirror label must be {en,zh}`);
            if (!m.url) err(`${aTag}: mirror url missing`);
          }
        }
      }
    }
  }
}

// Optional URL probe
if (PROBE && errors.length === 0) {
  const allUrls = [];
  for (const p of data.products ?? []) {
    for (const r of p.releases ?? []) {
      for (const a of r.artifacts ?? []) {
        if (a.url && /^https?:/.test(a.url)) allUrls.push({ tag: `${p.id}@${r.version}`, url: a.url });
        for (const m of a.mirrors ?? []) {
          if (m.url && /^https?:/.test(m.url)) allUrls.push({ tag: `${p.id}@${r.version}/${m.region}`, url: m.url });
        }
      }
    }
  }

  console.log(`Probing ${allUrls.length} URLs (HEAD)...`);
  await Promise.all(
    allUrls.map(async ({ tag, url }) => {
      try {
        const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
        if (!res.ok) warn(`${tag}: HEAD ${url} → HTTP ${res.status}`);
      } catch (e) {
        warn(`${tag}: HEAD ${url} → ${e.message}`);
      }
    }),
  );
}

if (errors.length) {
  console.error('\n❌ Errors (release blockers):');
  for (const e of errors) console.error('  · ' + e);
}
if (warnings.length) {
  console.warn('\n⚠ Warnings:');
  for (const w of warnings) console.warn('  · ' + w);
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('✓ enterprise-products.json passes all checks');
}

if (errors.length) process.exit(1);
if (STRICT && warnings.length) process.exit(2);
process.exit(0);
