import { existsSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const requiredTraces = [
  '.next/server/app/[locale]/blog/page.js.nft.json',
  '.next/server/app/[locale]/blog/[slug]/page.js.nft.json',
];

function collectTraces(directory) {
  const traces = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) traces.push(...collectTraces(file));
    else if (entry.isFile() && entry.name.endsWith('.nft.json')) traces.push(file);
  }
  return traces.sort();
}

export function validateBlogFunctionTraces(root) {
  root = path.resolve(root);
  const publicDirectory = path.join(root, 'public');
  const traces = collectTraces(path.join(root, '.next/server'));
  if (traces.length === 0) throw new Error('No server function traces found. Run a production build first.');

  const traceSet = new Set(traces);
  for (const name of requiredTraces) {
    if (!traceSet.has(path.join(root, name))) throw new Error(`Missing required build trace: ${name}`);
  }

  for (const trace of traces) {
    const name = path.relative(root, trace);
    let data;
    try {
      data = JSON.parse(readFileSync(trace, 'utf8'));
    } catch (error) {
      throw new Error(`Cannot read build trace: ${name}`, { cause: error });
    }
    if (!data || !Array.isArray(data.files) || data.files.some((file) => typeof file !== 'string' || file.length === 0)) {
      throw new Error(`Invalid file list in build trace: ${name}`);
    }
    const publicFiles = data.files.filter((file) => {
      const relative = path.relative(publicDirectory, path.resolve(path.dirname(trace), file));
      return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
    });
    if (publicFiles.length) {
      throw new Error(`${name} bundles ${publicFiles.length} public assets into the server function. Use the generated asset-path manifest instead of runtime filesystem access. First asset: ${publicFiles[0]}`);
    }
  }
  return traces.length;
}

if (process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const count = validateBlogFunctionTraces(fileURLToPath(new URL('..', import.meta.url)));
  console.log(`PASS ${count} server function traces: no public assets`);
}
