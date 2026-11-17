import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Keep asset existence checks independent of serverless filesystem bundles.
const root = path.resolve('public');
async function list(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const groups = await Promise.all(entries.map(async entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? list(file) : ['/' + path.relative(root, file).split(path.sep).join('/')];
  }));
  return groups.flat();
}
await writeFile('src/content/public-assets.json', JSON.stringify((await list(root)).sort(), null, 2) + '\n');
