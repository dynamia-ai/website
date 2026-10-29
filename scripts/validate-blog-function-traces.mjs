import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const publicDirectory = path.join(root, 'public');
const traces = [
  '.next/server/app/[locale]/blog/page.js.nft.json',
  '.next/server/app/[locale]/blog/[slug]/page.js.nft.json',
];

for (const name of traces) {
  const trace = path.join(root, name);
  const { files } = JSON.parse(readFileSync(trace, 'utf8'));
  const publicFiles = files.filter((file) => {
    const relative = path.relative(publicDirectory, path.resolve(path.dirname(trace), file));
    return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
  });
  if (publicFiles.length) {
    throw new Error(`${name} bundles ${publicFiles.length} public assets into the server function. Use the generated asset-path manifest instead of runtime filesystem access. First asset: ${publicFiles[0]}`);
  }
  console.log(`PASS ${name}: no public assets in the server function`);
}
