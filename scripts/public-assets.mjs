import { mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export function collectPublicAssetPaths(publicDirectory) {
  const paths = [];
  function visit(directory, prefix) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const assetPath = `${prefix}/${entry.name}`;
      if (entry.isDirectory()) visit(path.join(directory, entry.name), assetPath);
      else if (entry.isFile()) paths.push(assetPath);
    }
  }
  visit(publicDirectory, '');
  return paths.sort();
}

export function writePublicAssetManifest(root) {
  const output = path.join(root, 'src/generated/public-asset-paths.json');
  const content = `${JSON.stringify(collectPublicAssetPaths(path.join(root, 'public')), null, 2)}\n`;
  try {
    if (readFileSync(output, 'utf8') === content) return;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  mkdirSync(path.dirname(output), { recursive: true });
  // Config can load in multiple build workers; readers should only see complete JSON.
  const temporary = `${output}.${process.pid}.tmp`;
  writeFileSync(temporary, content);
  renameSync(temporary, output);
}

// Keep newly added/deleted images visible to metadata during an existing dev session.
export class PublicAssetManifestPlugin {
  constructor(root) {
    this.root = root;
  }

  apply(compiler) {
    compiler.hooks.beforeCompile.tap('PublicAssetManifest', () => {
      writePublicAssetManifest(this.root);
    });
    compiler.hooks.afterCompile.tap('PublicAssetManifest', (compilation) => {
      compilation.contextDependencies.add(path.join(this.root, 'public'));
    });
  }
}
