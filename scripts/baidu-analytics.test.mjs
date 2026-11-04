import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';
import ts from 'typescript';

test('Baidu tracking respects consent and reports each route once', () => {
  let pathname = '/zh';
  const refs = [];
  let cursor = 0;
  let reloads = 0;
  const scripts = [];
  const expired = [];
  const document = {
    get cookie() { return 'Hm_lvt_example=1; _ga_example=2; dynamia_cookie_consent=record'; },
    set cookie(value) { expired.push(value); },
    getElementById(id) { return scripts.find((script) => script.id === id); },
    createElement() { return {}; },
    head: { appendChild(script) { scripts.push(script); } },
  };
  const window = { location: { hostname: 'dynamia.ai', reload() { reloads++; } } };
  const module = { exports: {} };
  const context = {
    module, exports: module.exports, document, window,
    require(name) {
      if (name === 'react') return {
        useEffect(effect) { effect(); },
        useRef(value) { const index = cursor++; return refs[index] ??= { current: value }; },
      };
      if (name === 'next/navigation') return { usePathname: () => pathname };
      throw new Error(`Unexpected module: ${name}`);
    },
  };
  const code = ts.transpileModule(readFileSync('src/components/BaiduAnalytics.tsx', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(code, context);
  const render = (enabled) => { cursor = 0; module.exports.default({ enabled }); };
  render(false);
  assert.equal(scripts.length, 0);
  assert.equal(window._hmt, undefined);
  render(true);
  render(true); // React Strict Mode's effect replay must not duplicate the PV.
  assert.equal(scripts.length, 1);
  assert.equal(scripts[0].src, 'https://hm.baidu.com/hm.js?5e22c8b43514e0490cfea9581bbd4ba0');
  pathname = '/products';
  render(true);
  assert.equal(JSON.stringify(window._hmt), JSON.stringify([
    ['_setAutoPageview', false], ['_trackPageview', '/zh'], ['_trackPageview', '/products'],
  ]));
  render(false);
  assert.equal(reloads, 1);
  assert.ok(expired.some((cookie) => cookie.startsWith('Hm_lvt_example=')));
  assert.ok(expired.every((cookie) => !cookie.startsWith('dynamia_cookie_consent=')));
});
