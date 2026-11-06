// One-time import of the approved complete demo. No upstream website copy is merged.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {parse} from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';

const source = fs.readFileSync('scripts/redesign/import-script.tmp', 'utf8');
const ast = parse(source);
const data = {};
const names = new Set(['CASE_LIBRARY', 'CONTENT_DATA', 'ARTICLE_DETAILS', 'OVERVIEW_DATA']);
for (const node of ast.program.body) {
  if (node.type !== 'VariableDeclaration') continue;
  for (const declaration of node.declarations) {
    if (!names.has(declaration.id.name)) continue;
    data[declaration.id.name] = JSON.parse(source.slice(declaration.init.start, declaration.init.end));
    declaration.init = t.memberExpression(t.identifier('data'), t.identifier(declaration.id.name));
  }
}
fs.writeFileSync('src/content/redesign/site.json', JSON.stringify(data));
const {ARTICLE_DETAILS, ...catalog} = data;
fs.writeFileSync('public/redesign/site-data.json', JSON.stringify(catalog));
fs.mkdirSync('public/redesign/articles', {recursive:true});
for (const [id, article] of Object.entries(ARTICLE_DETAILS)) {
  fs.writeFileSync(`public/redesign/articles/${id}.json`, JSON.stringify(article));
}

// UI strings are kept separately from HTML structure. Long-form articles remain CMS content.
const copy = {};
function keyFor(value) {
  const key = 's' + crypto.createHash('sha256').update(value).digest('hex').slice(0, 14);
  copy[key] = value;
  return key;
}
function textExpr(value) {
  return t.callExpression(t.identifier('uiCopy'), [t.stringLiteral(keyFor(value))]);
}
function pieces(value, state) {
  const result = [];
  let literal = '', visible = '';
  const flushText = () => {
    if (!visible) return;
    if (visible.trim()) {
      if (literal) { result.push(literal); literal = ''; }
      result.push(textExpr(visible));
    } else literal += visible;
    visible = '';
  };
  for (const char of value) {
    if (state.tag) {
      literal += char;
      if (state.quote) { if (char === state.quote) state.quote = ''; }
      else if (char === '"' || char === "'") state.quote = char;
      else if (char === '>') state.tag = false;
    } else if (char === '<') {
      flushText(); state.tag = true; literal += char;
    } else visible += char;
  }
  flushText();
  if (literal) result.push(literal);
  return result;
}
function asTemplate(parts) {
  const quasis = [], expressions = [];
  let buffer = '';
  for (const part of parts) {
    if (typeof part === 'string') buffer += part;
    else {
      quasis.push(t.templateElement({raw:buffer.replace(/\\/g,'\\\\').replace(/`/g,'\\`').replace(/\$\{/g,'\\${'),cooked:buffer}));
      expressions.push(part); buffer = '';
    }
  }
  quasis.push(t.templateElement({raw:buffer.replace(/\\/g,'\\\\').replace(/`/g,'\\`').replace(/\$\{/g,'\\${'),cooked:buffer},true));
  return t.templateLiteral(quasis,expressions);
}
traverse(ast, {
  TemplateLiteral: {exit(path) {
    const state = {tag:false,quote:''}, parts=[];
    // Some literals are attribute fragments; don't treat their syntax as text.
    if (path.node.quasis[0].value.cooked?.startsWith('"')) state.tag = true;
    path.node.quasis.forEach((q,i) => {
      parts.push(...pieces(q.value.cooked ?? q.value.raw,state));
      if (i < path.node.expressions.length) parts.push(path.node.expressions[i]);
    });
    path.replaceWith(asTemplate(parts)); path.skip();
  }},
  StringLiteral(path) {
    if ((path.parent.type === 'ObjectProperty' || path.parent.type === 'ObjectMethod') && path.key === 'key') return;
    const value = path.node.value;
    if (!value || !/[A-Za-z\u3400-\u9fff]/.test(value)) return;
    if (value.includes('<') && /<\/?[a-z!]/i.test(value)) {
      path.replaceWith(asTemplate(pieces(value,{tag:false,quote:''})));
    } else path.replaceWith(textExpr(value));
    path.skip();
  },
  ReferencedIdentifier(path) {
    if (['innerHeight','scrollY'].includes(path.node.name) && !path.scope.hasBinding(path.node.name)) {
      path.replaceWith(t.memberExpression(t.identifier('window'),t.identifier(path.node.name)));path.skip();
    }
  }
});
const runtime = generate(ast, {comments:true}).code.replace('function render() {','function render() { if (context.nativeShell) return;');
const prefix = `/* Approved complete demo interactions, migrated without changing editorial content. */
export function mountRedesign(root, context) {
const {document, window, location, localStorage, navigator, matchMedia,
requestAnimationFrame, cancelAnimationFrame, setTimeout, clearTimeout,
Blob, FormData, URL, URLSearchParams, data, text: uiCopy} = context;
`;
fs.writeFileSync('public/redesign/runtime.js', prefix + runtime + '\nreturn {render};\n}\n');
fs.writeFileSync('dictionary/redesign/zh.json', JSON.stringify(copy,null,2));
console.log(`Imported ${data.CONTENT_DATA.posts.length} posts, ${data.CASE_LIBRARY.length} cases; ${Object.keys(copy).length} UI strings.`);
